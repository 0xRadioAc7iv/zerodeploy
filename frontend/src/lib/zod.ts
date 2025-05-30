import z from "zod";

export const deployRequestBody = z.object({
  repoUrl: z.string().nonempty(),
  defaultBranch: z.string().nonempty(),
  framework: z.string().nonempty(),
  installCommand: z.string().nonempty(),
  buildCommand: z.string().nonempty(),
  outputDirectory: z.string().nonempty(),
});
