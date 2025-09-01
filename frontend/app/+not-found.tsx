import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-2xl font-bold">This screen doesn't exist.</Text>

        <Link href="/" className="mt-3 p-4">
          <Text className="text-lg text-primary">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
