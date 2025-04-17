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

    function handleChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const key = target.id as keyof Student;
        // Finally, set student data
        setStudentData(stud => ({
            ...stud,
            [key]: target.value,
            date: parse(target.value, 'MM/dd/yyyy', new Date())
        }));
    }

    return (
       <form class='w-10 flex border bg-slate-100 border-blue-700 rounded-2xl' method='get'>
            <h1 class='text-2xl'>Add New Student</h1>
            <input
                type='text'
                name='Student ID'
                id='studentID'
                value={studentData().studentID}
                placeholder='Enter your Student ID here'
                onInput={handleChange}
            />
            <input
                type='text'
                name='Student Name'
                id='studentName'
                value={studentData().studentName}
                placeholder='Enter your Student Name here'
                onInput={handleChange}
            />
            <input
                type='text'
                name='Course Name'
                id='courseName'
                value={studentData().courseName}
                placeholder='Enter your Course Name here'
                onInput={handleChange}
            />
            <input
                type='date'
                name='Date'
                id='date'
                value={format(studentData().date, 'MM/dd/yyyy')}
                placeholder='Enter your Date here'
                onInput={handleChange}
            />
            <button type='submit' class='border rounded'>
                Submit
            </button>
       </form>
    )
}

// render(() => <RetrieveForm />, document.getElementById('form'))
