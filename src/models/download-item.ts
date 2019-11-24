export default interface DownloadItem {
  id: string
  status: string
  filepath: string
  filename: string
  url: string
  receivedBytes: number
  totalBytes: number
  startTime: number
}
