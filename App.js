import React, {useContext, useEffect, useRef, useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {RNFFmpegConfig} from 'react-native-ffmpeg';

import StartScreen from './src/screens/StartScreen';
import TrimmerScreen from './src/screens/TrimmerScreen';
import TasksScreen from './src/screens/TasksScreen';
import VideosScreen from './src/screens/VideosScreen';
import AudiosScreen from './src/screens/AudiosScreen';
import AboutScreen from './src/screens/AboutScreen';
import PolicyScreen from './src/screens/PolicyScreen';
import TermsScreen from './src/screens/TermsScreen';

import TrimStackHeader from './src/components/TrimStackHeader';

import {
  Provider as AppProvider,
  Context as AppContext,
} from './src/context/AppContext';

import {
  Provider as TasksProvider,
  Context as TasksContext,
} from './src/context/TasksContext';

import {Provider as VideosProvider} from './src/context/VideosContext';
import {Provider as AudiosProvider} from './src/context/AudiosContext';

import appStyles from './src/appStyles';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TrimStack = () => {
  return (
    <Stack.Navigator
      screenOptions={props => {
        return {
          header: () => <TrimStackHeader {...props} />,
        };
      }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Trimmer" component={TrimmerScreen} />
    </Stack.Navigator>
  );
};

const AboutStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="About"
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: '#757583',
      }}>
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Privacy Policy" component={PolicyScreen} />
      <Stack.Screen name="Terms & Conditions" component={TermsScreen} />
    </Stack.Navigator>
  );
};

const tabBarIcon = (IconType, name) => {
  return ({color, focused}) => {
    return <IconType style={styles.tabBarIcon} name={name} color={color} />;
  };
};

const DownloadsTab = () => {
  return (
    <Tab.Navigator
      screenOptions={() => {
        return {
          header: () => null,
          tabBarStyle: appStyles.downloadsTabBarStyle,
          tabBarInactiveTintColor: '#7A7984',
          tabBarActiveTintColor: appStyles.colors.primary,
          tabBarItemStyle: styles.tabBarItem,
        };
      }}>
      <Tab.Screen
        name="Videos"
        component={VideosScreen}
        options={{
          tabBarIcon: tabBarIcon(Entypo, 'folder-video'),
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Audios"
        component={AudiosScreen}
        options={{
          tabBarIcon: tabBarIcon(MaterialIcons, 'audiotrack'),
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const {addFFmpegStatistics} = useContext(AppContext);
  const {setIsTaskCancelled} = useContext(TasksContext);
  const isTaskCancelled = useRef(false);

  useEffect(() => {
    RNFFmpegConfig.disableLogs();
    RNFFmpegConfig.enableStatisticsCallback(addFFmpegStatistics);
    setIsTaskCancelled(isTaskCancelled);
  }, []);

  return useMemo(() => {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarInactiveTintColor: '#7A7984',
            tabBarActiveTintColor: appStyles.colors.primary,
            tabBarItemStyle: styles.tabBarItem,
          }}>
          <Tab.Screen
            name="Trim"
            component={TrimStack}
            options={{
              header: () => null,
              tabBarIcon: tabBarIcon(Entypo, 'scissors'),
              tabBarLabel: 'Trim',
              tabBarHideOnKeyboard: true,
            }}
          />
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
              headerStyle: styles.header,
              headerTitleStyle: styles.headerTitle,
              tabBarIcon: tabBarIcon(FontAwesome, 'tasks'),
            }}
          />
          <Tab.Screen
            name="Downloads"
            component={DownloadsTab}
            options={{
              headerStyle: styles.header,
              headerTitleStyle: styles.headerTitle,
              tabBarIcon: tabBarIcon(FontAwesome, 'download'),
            }}
          />
          <Tab.Screen
            name="Abouts"
            component={AboutStack}
            options={{
              header: () => null,
              headerStyle: styles.header,
              headerTitleStyle: styles.headerTitle,
              tabBarIcon: tabBarIcon(Feather, 'info'),
              tabBarLabel: 'About',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }, []);
};

export default () => {
  return (
    <AppProvider>
      <TasksProvider>
        <VideosProvider>
          <AudiosProvider>
            <App />
          </AudiosProvider>
        </VideosProvider>
      </TasksProvider>
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: appStyles.colors.screenBackground,
    height: 60,
    borderBottomWidth: 0,
    borderBottomColor: appStyles.colors.screenBackground,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerTitle: {
    color: '#757583',
  },
  tabBar: {
    height: 60,
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 0,
    backgroundColor: appStyles.colors.bottomTabs,
  },
  tabBarItem: {
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    marginBottom: 5,
    fontWeight: '600',
  },
  tabBarIcon: {
    fontSize: 20,
  },
});
