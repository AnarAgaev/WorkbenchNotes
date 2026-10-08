// src/app/(demo)/optimistic-lab/page.tsx
import Container from "@/components/layout/Container";
import OptimisticLabClient from "./optimistic-lab-client";

export default function OptimisticLabPage() {
  return (
    <Container>
      <OptimisticLabClient />
    </Container>
  );
}
