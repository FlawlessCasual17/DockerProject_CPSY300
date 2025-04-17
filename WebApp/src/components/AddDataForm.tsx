import { format, parse, parseISO, parseJSON } from 'date-fns';
import { createSignal } from 'solid-js';
// import { render } from 'solid-js/web';
import type { Student } from '../types';

// TODO: Add code for creating a UI to manipulate the API of Student API (StudentDB)
export default function AddDataForm() {
    const [studentData, setStudentData] = createSignal<Student>({
        studentID: '',
        studentName: '',
        courseName: '',
        date: new Date()
    }, { equals: false });

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const key = target.id as keyof Student;
        // Finally, set student data
        setStudentData(stud => ({
            ...stud,
            [key]: target.value,
            date: parse(target.value, 'MM/dd/yyyy', new Date())
        }));
    }

    function handleSubmit(event: SubmitEvent) {
        // TODO: Add code here for handling submit (maybe use HTMLFormElement)
    }

    return (
       <form
            class='p-10 w-[336px] flex flex-col space-y-3 border bg-slate-100 border-slate-500 rounded-2xl'
            method='get'
            onSubmit={handleSubmit}
       >
            <h1 class='relative text-2xl bottom-2.5'>Add New Student</h1>
            <input
                class='rounded border border-slate-900 bg-gray-300 p-1'
                id='studentID'
                type='text'
                name='Student ID'
                value={studentData().studentID}
                placeholder='Enter your Student ID here'
                onInput={handleInput}
            />
            <input
                class='rounded border border-slate-900 bg-gray-300 p-1'
                id='studentName'
                type='text'
                name='Student Name'
                value={studentData().studentName}
                placeholder='Enter your Student Name here'
                onInput={handleInput}
            />
            <input
                class='rounded border border-slate-900 bg-gray-300 p-1'
                id='courseName'
                type='text'
                name='Course Name'
                value={studentData().courseName}
                placeholder='Enter your Course Name here'
                onInput={handleInput}
            />
            <input
                class='rounded border border-slate-900 bg-gray-300 p-1'
                id='date'
                type='date'
                name='Date'
                value={format(studentData().date, 'MM/dd/yyyy')}
                placeholder='Enter your Date here'
                onInput={handleInput}
            />
            <button type='submit' class='border border-green-900 bg-green-500 rounded hover:cursor-pointer'>
                Submit
            </button>
       </form>
    )
}

// render(() => <RetrieveForm />, document.getElementById('form'))
