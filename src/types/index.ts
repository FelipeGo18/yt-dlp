export interface VideoFormat {
  format_id: string;
  format_note?: string;
  ext: string;
  resolution?: string;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  tbr?: number;
}

export type DownloadMode = "merged" | "audio_only" | "video_only" | "separate";

export interface VideoMetadata {
  id: string;
  title: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url: string;
  formats: VideoFormat[];
  is_playlist: boolean;
  playlist_count?: number;
}

export interface DownloadRequest {
  download_id: string;
  url: string;
  format_id?: string;
  output_dir: string;
  audio_only: boolean;
  download_mode?: DownloadMode;
  embed_subs: boolean;
  time_from?: string;
  time_to?: string;
  extra_args?: string[];
}

export interface DownloadProgress {
  download_id: string;
  status: "downloading" | "merging" | "finished" | "error";
  percent: number;
  speed?: string;
  eta?: string;
  filename?: string;
  message?: string;
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  format_id?: string;
  output_dir: string;
  audio_only: boolean;
  download_mode?: DownloadMode;
  embed_subs: boolean;
  progress: number;
  status: "queued" | "downloading" | "merging" | "finished" | "error" | "cancelled";
  speed?: string;
  eta?: string;
  errorMessage?: string;
  createdAt: number;
}

export interface AppConfig {
  output_dir: string;
  default_format: string;
  audio_only: boolean;
  embed_subs: boolean;
  concurrent_downloads: number;
  theme: string;
}
