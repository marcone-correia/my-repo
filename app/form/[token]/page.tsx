import FormAssistant from "@/components/FormAssistant";

export default function FormPage({ params }: { params: { token: string } }) {
  return <FormAssistant token={params.token} />;
}
