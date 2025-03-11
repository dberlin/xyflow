import { createContext } from 'solid-js';
import type { ProviderContext } from '../store/types';
import { type ConnectableContext } from '../components/NodeWrapper/types';

export const EdgeIdContext = createContext<string>('');
export const NodeIdContext = createContext<string>('');
export const FlowStoreContext = createContext<ProviderContext | undefined>(undefined);
export const NodeConnectableContext = createContext<ConnectableContext | undefined>(undefined);
