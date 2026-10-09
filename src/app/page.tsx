// src/app/page.tsx
import Container from "@/components/layout/Container";
import HomePageClient from "@/app/_ui/HomePageClient";

// делаем ISR-кэш маршрута, чтобы revalidatePath("/") имел смысл как on-demand
export const revalidate = 3600;

export default function HomePage() {
  return (
    <Container>
      <HomePageClient />
    </Container>
  );
}
