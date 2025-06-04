import z from "zod";

export const deployRequestBody = z.object({
  repoUrl: z.string().nonempty(),
  defaultBranch: z.string().nonempty(),
  framework: z.string().nonempty(),
  installCommand: z.string(),
  buildCommand: z.string(),
  outputDirectory: z.string(),
  rootDirectory: z.string().nonempty(),
});
