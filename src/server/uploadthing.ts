import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
const f = createUploadthing();
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ metadata, file }) => {
      return { metadata, url: file.url };
    },
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
