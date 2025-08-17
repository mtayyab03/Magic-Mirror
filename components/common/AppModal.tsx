import React, { ReactNode } from "react";
import {
  Alert,
  Modal,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface AppModalProps {
  children: ReactNode;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  style?: StyleProp<ViewStyle>;
  RecStyle?: StyleProp<ViewStyle>;
}

const AppModal: React.FC<AppModalProps> = ({
  children,
  modalVisible,
  setModalVisible,
  style,
  RecStyle,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        setModalVisible(false);
      }}
    >
      <View style={[styles.modalBackground, style]}>
        <View style={[styles.modalContainer, RecStyle]}>{children}</View>
      </View>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
