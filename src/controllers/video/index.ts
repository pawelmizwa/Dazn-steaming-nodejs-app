import { Response, Request } from "express";
import { statSync, createReadStream } from "fs";
import { HttpErrorResponse } from "general/utils/errors";

export function getVideoController() {
  return async (req: Request, res: Response) => {
    const range = req.headers.range;
    if (range === undefined) {
      throw new HttpErrorResponse(400, { message: "Requires Range header" });
    }
    const videoPath = `${__dirname}/sample-mp4-file.mp4`;
    const videoSize = statSync(videoPath).size;

    const CHUNK_SIZE = 10 ** 6 / 2; // 500KB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  };
}
