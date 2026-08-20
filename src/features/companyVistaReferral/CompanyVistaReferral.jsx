import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { useThemeColors } from '../../theme/colors';
const { width } = Dimensions.get('window');
const CompanyVistaReferral = () => {
    const colors = useThemeColors();
    return (<View style={styles.cardContainer}>

      {/* Header Section */}
     

      {/* Illustration Area */}
      {/* <View style={styles.imageWrapper}>
        <Image source={require('../../assets/images/thanks.png')} style={styles.illustration} resizeMode="contain"/>
      </View> */}

    </View>);
};
const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 44,
        paddingTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 4,
        opacity: 0.4,
    },
    headerContainer: {
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerI: {
        fontSize: 18,
        fontWeight: '700',
        marginRight: 11,
    },
    heartIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    imageWrapper: {
        width: '100%',
        height: width * 1.1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20,
        marginBottom: 2,
    },
    illustration: {
        width: '100%',
        height: '100%',
    },
});
export default CompanyVistaReferral;
