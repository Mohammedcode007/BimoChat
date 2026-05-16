// src/hooks/useUploadFile.ts

import { useCallback, useState } from "react";
import type {
    LocalUploadFile,
    UploadFolder,
    UploadResponseData,
} from "../services/upload/types";
import {
    uploadMultipleFiles,
    uploadSingleFile,
} from "../services/upload/uploadApi";

type UploadState = {
  uploading: boolean;
  progress: number;
  error: string | null;
};

export function useUploadFile() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadOne = useCallback(
    async (params: {
      file: LocalUploadFile;
      folder: UploadFolder;
      userId?: string;
      endpoint?: string;
      extraFields?: Record<string, string | number | boolean | undefined | null>;
    }): Promise<UploadResponseData> => {
      try {
        setState({
          uploading: true,
          progress: 0,
          error: null,
        });

        const result = await uploadSingleFile(params);

        setState({
          uploading: false,
          progress: 100,
          error: null,
        });

        return result;
      } catch (error: any) {
        setState({
          uploading: false,
          progress: 0,
          error: error?.message || "Upload failed",
        });

        throw error;
      }
    },
    []
  );

  const uploadMany = useCallback(
    async (params: {
      files: LocalUploadFile[];
      folder: UploadFolder;
      userId?: string;
      endpoint?: string;
      extraFields?: Record<string, string | number | boolean | undefined | null>;
    }): Promise<UploadResponseData[]> => {
      try {
        setState({
          uploading: true,
          progress: 0,
          error: null,
        });

        const result = await uploadMultipleFiles(params);

        setState({
          uploading: false,
          progress: 100,
          error: null,
        });

        return result;
      } catch (error: any) {
        setState({
          uploading: false,
          progress: 0,
          error: error?.message || "Upload failed",
        });

        throw error;
      }
    },
    []
  );

  const resetUpload = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    uploading: state.uploading,
    progress: state.progress,
    uploadError: state.error,
    uploadOne,
    uploadMany,
    resetUpload,
  };
}