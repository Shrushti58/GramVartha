import { Stack } from 'expo-router';

export default function SchemesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Schemes' }} />
      <Stack.Screen name="[id]" options={{ title: 'Scheme Details' }} />
    </Stack>
  );
}
