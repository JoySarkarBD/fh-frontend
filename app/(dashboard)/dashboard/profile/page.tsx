
import { authKeys } from "@/actions/hooks/auth.hooks";
import ProfilePage from "@/components/shared/ProfilePage/ProfilePage";
import { getUserProfileAction } from "@/services/auth";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";


export default async function UserProfilePage() {
  const queryClient = new QueryClient();
  
  // Prefetch the user profile data
  await queryClient.prefetchQuery({
    queryKey: authKeys.profile,
    queryFn: getUserProfileAction,
  });

  // Get the profile data
  const profile = await getUserProfileAction();

  // If not authenticated, redirect to login
  // if (!profile) {
  //   redirect("/login");
  // }

  console.log(profile, 'this is profile');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfilePage initialProfile={profile} />
    </HydrationBoundary>
  );
}