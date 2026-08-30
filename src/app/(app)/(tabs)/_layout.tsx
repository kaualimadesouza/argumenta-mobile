import { Tabs } from 'expo-router'
import { colors, fontFamily } from '@/styles/tokens'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.caneta,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trilha',
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Progresso',
        }}
      />
    </Tabs>
  )
}
