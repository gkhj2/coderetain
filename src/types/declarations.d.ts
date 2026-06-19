// Type declarations for modules that don't have proper types in this environment

declare module "@expo/vector-icons" {
  import { ComponentType } from "react";
  import { TextStyle, ViewStyle } from "react-native";

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  export const Ionicons: ComponentType<IconProps>;
  export const MaterialIcons: ComponentType<IconProps>;
  export const MaterialCommunityIcons: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const AntDesign: ComponentType<IconProps>;
  export const Feather: ComponentType<IconProps>;
  export const Octicons: ComponentType<IconProps>;
}

declare module "expo-splash-screen" {
  export function preventAutoHideAsync(): Promise<void>;
  export function hideAsync(): Promise<void>;
  export function setOptions(options: {
    backgroundColor?: string;
    name?: string;
  }): void;
}

declare module "expo-sqlite" {
  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, params?: any[] | any): Promise<{ lastInsertRowId: number; changes: number }>;
    getFirstAsync<T = any>(sql: string, params?: any[] | any): Promise<T | null>;
    getAllAsync<T = any>(sql: string, params?: any[] | any): Promise<T[]>;
  }

  export function openDatabaseAsync(
    name: string,
    options?: { useNewConnection?: boolean }
  ): Promise<SQLiteDatabase>;
}

// Fix index.ts import
declare module "expo" {
  export function registerRootComponent(component: React.ComponentType<any>): void;
  export function isRunningInExpoGo(): boolean;
}
