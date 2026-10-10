import { AsoPage, DEFAULT_ASO_URL } from "@multica/views/aso";

// Read ASO_URL when the request is served, not when the image is built, so a
// self-hosted deployment can point at its ASO app through the environment.
export const dynamic = "force-dynamic";

export default function Page() {
  return <AsoPage src={process.env.ASO_URL || DEFAULT_ASO_URL} />;
}
