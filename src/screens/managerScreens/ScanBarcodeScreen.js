import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import CameraKitCamera, { Camera, CameraType } from 'react-native-camera-kit';
import { verifyToken } from '../../services/qrcodeService';
import { CheckCircle, XCircle, AlertTriangle, ScanLine } from 'lucide-react-native';

const colors = {
  primary: '#6200ee',
  background: '#f5f5f5',
  text: '#333',
  white: '#ffffff',
  success: '#28a745', 
  error: '#dc3545',
  disabled: '#999',
  border: '#e0e0e0',
};

const QRCodeScannerScreen = () => {
  const [cameraPermission, setCameraPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  // --- State for verification flow ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        setCameraPermission(hasPermission);
      } else if (CameraKitCamera) {
        const result = await CameraKitCamera.checkDeviceCameraAuthorizationStatus();
        setCameraPermission(result);
      } else {
        setCameraPermission(false);
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to scan QR codes',
          buttonPositive: 'OK',
        },
      );
      setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const result = await CameraKitCamera.requestDeviceCameraAuthorization();
      setCameraPermission(result);
    }
  };

  const resetScanner = () => {
    setStatusMessage(null);
    setIsError(false);
    setIsVerifying(false);
  };

  const handleBarcodeScan = async (event) => {
    if (isVerifying || statusMessage) {
      return;
    }

    setIsVerifying(true);
    const scannedValue = event.nativeEvent.codeStringValue;

    try {
      const qrData = JSON.parse(scannedValue);

      if (!qrData.order_id || !qrData.collection_token) {
        throw new Error("Invalid QR Code. Required data missing.");
      }

      const result = await verifyToken(qrData);

      setStatusMessage(result.message || "Verification Successful!");
      setIsError(false);

    } catch (err) {
      // console.error("Verification failed:", err);  

      let errorMessage = "An unknown error occurred.";

      // --- Handle backend JSON errors ---
      const backendError = err.data?.error || err.data?.message;

      if (backendError === "Invalid token") {
        errorMessage = "This QR code has expired or was already used.";
      } else if (backendError) {
        errorMessage = backendError;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setStatusMessage(errorMessage);
      setIsError(true);

    } finally {
      setIsVerifying(false);
    }
  };


  const renderResponseArea = () => {
    if (isVerifying) {
      return (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>Verifying...</Text>
        </>
      );
    }

    if (statusMessage) {
      const boxColor = isError ? colors.error : colors.success;
      const Icon = isError ? XCircle : CheckCircle;

      return (
        <>
          <Icon size={48} color={boxColor} />
          <Text style={[styles.statusText, { color: boxColor, fontSize: 18 }]}>
            {statusMessage}
          </Text>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: boxColor }]}
            onPress={resetScanner}
          >
            <Text style={styles.clearButtonText}>Clear & Scan Next</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <ScanLine size={48} color={colors.disabled} />
        <Text style={styles.promptText}>
          Point camera at a QR code to scan
        </Text>
      </>
    );
  };

  if (isCheckingPermission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.infoText}>Checking permissions...</Text>
      </View>
    );
  }

  if (!cameraPermission) {
    return (
      <View style={styles.centerContainer}>
        <AlertTriangle size={40} color={colors.text} />
        <Text style={styles.infoText}>
          Camera permission is required to scan QR codes.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // Replaced SafeAreaView with standard View
    <View style={styles.container}>
      {/* This View will now extend up to the status bar.
        If you have an AppBar provided by your navigation/parent, 
        this CameraView should start right below it, filling the space.
      */}
      <View style={styles.cameraPreviewContainer}>
        <Camera
          style={styles.camera}
          cameraType={CameraType.Back}
          scanBarcode={true}
          scanQRCode={true}
          onReadCode={handleBarcodeScan}
          showFrame={true}
          laserColor="rgba(98, 0, 238, 0.5)"
          frameColor="rgba(98, 0, 238, 0.8)"
        />
      </View>

      {/* Bottom half: Response Area */}
      <View style={styles.responseContainer}>
        {renderResponseArea()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // No changes needed here, flex: 1 on a standard View covers the whole screen.
  container: {
    flex: 1,
    backgroundColor: colors.white, // Set background to white
  },
  // --- Camera Preview Area ---
  cameraPreviewContainer: {
    flex: 1, // Give camera slightly more space
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  // --- Response Area (Bottom) ---
  responseContainer: {
    flex: 1, // Take up remaining space
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  promptText: {
    fontSize: 16,
    color: colors.disabled,
    textAlign: 'center',
    marginTop: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  clearButton: {
    width: '100%',
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
  },
  clearButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // --- Permission/Loading States ---
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.background,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginVertical: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeScannerScreen;