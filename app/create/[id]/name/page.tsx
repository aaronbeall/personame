import { NameStep } from '@/components/name-step'
export default async function NamePage({params}:{params:Promise<{id:string}>}){return <NameStep quizId={(await params).id}/>}
