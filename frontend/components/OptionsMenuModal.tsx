import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

// Defines the shape for each menu item
export interface MenuOption {
  title: string;
  onPress?: () => any | Promise<any>;
  isDestructive?: boolean; // For styling things like "Delete" in red
}

// Defines the props the component will accept
interface OptionsMenuProps {
  isVisible: boolean;
  onClose: () => void;

  options: MenuOption[];
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({ isVisible, onClose, options }) => {


  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose} // For Android back button
    >
      {/* Touchable overlay to close the modal when tapping the background */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          {/* This inner Touchable prevents the modal from closing when tapping inside the menu */}
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              {/* Render each option from the props */}
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => {
                    // First, execute the option's action
                    option.onPress();
                    // Then, close the modal
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, option.isDestructive && styles.destructiveText]}>
                    {option.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1E1E1E', // A dark, modern background
    borderRadius: 14,
    width: '75%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden', // Ensures the border radius is respected by children
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3A3A3A',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  destructiveText: {
    color: '#FF453A', // A standard iOS red for destructive actions
    fontWeight: 'bold',
  },
});

export default OptionsMenu;