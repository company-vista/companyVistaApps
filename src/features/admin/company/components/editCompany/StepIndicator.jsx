import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { STEP_TITLES } from '../../utils/editCompanyForm';
import { screenStyles } from './editCompanyStyles';

const StepIndicator = ({ currentStep, totalSteps = 3 }) => (
  <View style={screenStyles.stepWrapper}>
    <View style={screenStyles.stepTrack} />
    <View style={screenStyles.stepRow}>
      {STEP_TITLES.map((step, index) => {
        const active = index === currentStep;
        const done = index < currentStep;
        return (
          <View key={step.key} style={screenStyles.stepNode}>
            <View
              style={[
                screenStyles.stepCircle,
                active && screenStyles.stepCircleActive,
                done && screenStyles.stepCircleDone,
              ]}>
              {done ? (
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              ) : (
                <Text
                  style={[
                    screenStyles.stepNumber,
                    active && screenStyles.stepNumberActive,
                  ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[
                screenStyles.stepLabel,
                active && screenStyles.stepLabelActive,
                done && screenStyles.stepLabelDone,
              ]}>
              {step.title}
            </Text>
          </View>
        );
      })}
    </View>
    <Text style={screenStyles.stepSubtitle}>
      Step {currentStep + 1} of {totalSteps} ·{' '}
      {STEP_TITLES[currentStep]?.subtitle}
    </Text>
  </View>
);

export default StepIndicator;
