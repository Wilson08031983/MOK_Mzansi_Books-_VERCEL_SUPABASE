// Global type declarations for the application

// Minimal Buffer type declaration
declare const Buffer: {
  from(array: ArrayLike<number> | ArrayBufferLike): Uint8Array;
  from(array: ArrayLike<number> | ArrayBufferLike, byteOffset?: number, length?: number): Uint8Array;
  from(array: string, encoding?: BufferEncoding): Uint8Array;
  alloc(size: number, fill?: string | number | Uint8Array, encoding?: BufferEncoding): Uint8Array;
  isBuffer(obj: any): obj is Uint8Array;
  concat(arrays: Uint8Array[], totalLength?: number): Uint8Array;
};

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
  
  // Make Buffer available globally
  const Buffer: typeof Buffer;
}

export {};
