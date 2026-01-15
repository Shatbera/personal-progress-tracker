import LogInForm from "./_components/log-in-from";

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }){
    return <LogInForm callbackUrl={searchParams.callbackUrl} />;
}