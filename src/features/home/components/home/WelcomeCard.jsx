import { Pressable, Text, View } from 'react-native';
import styles from './WelcomeCard.styles';
function WelcomeCard() {
    return (<View style={styles.rewardCard}>
      <View style={styles.rewardText}>
        <Text style={styles.rewardTitle}>
          Welcome to Company Vista <Text style={styles.rewardBrand}>WORKSPACE</Text>
        </Text>
        <Text style={styles.rewardSubtitle}>
          Manage company compliance, documents, and key business updates in one
          simple workspace.
        </Text>
        <Pressable style={styles.enrollButton}>
          <Text style={styles.enrollText}>Get Started</Text>
        </Pressable>
      </View>
      <View style={styles.coin}>
        <Text style={styles.coinText}>CV</Text>
      </View>
    </View>);
}
export default WelcomeCard;
