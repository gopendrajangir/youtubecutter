import React from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import appStyles from '../appStyles';

const getElementStyle = (type, element) => {
  switch (type) {
    case 'outline_secondary':
      switch (element) {
        case 'button':
          return {...styles.outlineButton, ...styles.outlineSecondaryButton};
        case 'text':
          return styles.secondaryButtonText;
        case 'icon':
          return styles.secondaryButtonIcon;
        default:
          return {};
      }
    case 'outline_primary':
      switch (element) {
        case 'button':
          return {...styles.outlineButton, ...styles.outlinePrimaryButton};
        case 'text':
          return styles.primaryButtonText;
        case 'icon':
          return styles.primaryButtonIcon;
        default:
          return {};
      }
    case 'link_primary':
      switch (element) {
        case 'button':
          return {...styles.link};
        case 'text':
          return {...styles.linkText, ...styles.linkPrimaryText};
        default:
          return {};
      }
    case 'link_secondary':
      switch (element) {
        case 'button':
          return {...styles.link};
        case 'text':
          return {...styles.linkText, ...styles.linkSecondaryText};
        default:
          return {};
      }
    default: {
      switch (element) {
        case 'button':
          return styles.defaultButton;
        case 'text':
          return styles.defaultButtonText;
        case 'icon':
          return styles.defaultButtonIcon;
        default:
          return {};
      }
    }
  }
};

const Button = ({
  type,
  title,
  IconType,
  iconName,
  disabled,
  onPress,
  style,
  textStyle,
  iconStyle,
  loading,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        ...styles.button,
        ...getElementStyle(type, 'button'),
        ...(disabled ? styles.disabledButton : {}),
        ...style,
      }}>
      <Text
        style={{
          ...styles.buttonText,
          ...getElementStyle(type, 'text'),
          ...(disabled ? styles.disabledButtonText : {}),
          ...textStyle,
        }}>
        {title}
      </Text>
      {IconType && !loading && (
        <IconType
          style={{
            ...styles.buttonIcon,
            ...getElementStyle(type, 'icon'),
            ...(disabled ? styles.disabledButtonIcon : {}),
            ...iconStyle,
          }}
          name={iconName}
          size={24}
        />
      )}
      {loading && (
        <ActivityIndicator
          style={styles.activityIndicator}
          size="small"
          color="#888"
        />
      )}
    </TouchableOpacity>
  );
};

Button.defaultProps = {
  type: 'default',
  disabled: false,
  loading: false,
  style: {},
  textStyle: {},
  iconStyle: {},
};

Button.propTypes = {
  type: PropTypes.string,
  IconType: PropTypes.elementType,
  iconName: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  textStyle: PropTypes.object,
  iconStyle: PropTypes.object,
  loading: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 50,
  },
  buttonText: {
    textTransform: 'uppercase',
    fontSize: 13,
    fontWeight: '400',
  },
  buttonIcon: {
    fontSize: 18,
    marginLeft: 5,
  },
  defaultButton: {
    backgroundColor: appStyles.colors.primary,
  },
  defaultButtonText: {
    color: '#fff',
  },
  defaultButtonIcon: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.4,
    borderWidth: 0,
  },
  disabledButtonText: {
    color: '#999',
  },
  disabledButtonIcon: {
    color: '#999',
  },
  outlineButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  outlinePrimaryButton: {
    borderColor: appStyles.colors.primary,
  },
  outlineSecondaryButton: {
    borderColor: '#999',
  },
  link: {
    height: 'auto',
  },
  linkText: {
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  linkPrimaryText: {
    color: appStyles.colors.primary,
  },
  linkSecondaryText: {
    color: '#999',
  },
  primaryButtonText: {
    color: appStyles.colors.primary,
  },
  primaryButtonIcon: {
    color: appStyles.colors.primary,
  },
  secondaryButtonText: {
    color: '#999',
  },
  secondaryButtonIcon: {
    color: '#999',
  },
  activityIndicator: {
    marginLeft: 10,
    color: '#ddd',
  },
});
