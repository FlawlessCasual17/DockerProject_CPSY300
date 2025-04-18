import { format, parse } from 'date-fns';
import { createSignal } from 'solid-js';
// import { render } from 'solid-js/web';
import type { Student } from '../types';

export default function AddDataForm() {
    const [studentData, setStudentData] = createSignal<Student>(
        {
            studentID: '',
            studentName: '',
            courseName: '',
            Date: new Date()
        },
        { equals: false }
    );

    // const [error, setError] = createSignal('');

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

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault;

        if (Object.values(studentData()).every(v => v === null))
            console.log('Either all or some properties in `studentData()` were not filled');

        try {
            const response = await fetch('http://127.0.0.1:8080/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...studentData() })
            });

            const data = await response.json();

            if (!response.ok) {
                const error = data.error || 'Unknown error occurred.';
                console.log(error);
                // setError(error);
                alert(error)
            }

            alert('Student added successfully!')
            console.log('Student added successfully!', data)
        } catch (error) {
            error = error instanceof Error ? error : 'Unknown error occurred.';
            console.error(error);
            // setError('Failed to add student');
            alert('Failed to add student')
        }
    }

    return (
        <form
            class='rounded-2xl border-2 p-10 w-[336px] flex flex-col space-y-3 bg-slate-100 border-slate-500 scale-125'
            onSubmit={handleSubmit}
        >
            <h1 class='relative text-2xl bottom-2.5'>Add New Student</h1>
            <input
                class='rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                id='studentID'
                type='text'
                name='Student ID'
                value={studentData().studentID}
                placeholder='Enter your Student ID here'
                onInput={handleInput}
                required
            />
            <input
                class='rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                id='studentName'
                type='text'
                name='Student Name'
                value={studentData().studentName}
                placeholder='Enter your Student Name here'
                onInput={handleInput}
                required
            />
            <input
                class='rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                id='courseName'
                type='text'
                name='Course Name'
                value={studentData().courseName}
                placeholder='Enter your Course Name here'
                onInput={handleInput}
                required
            />
            <input
                class='rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                id='date'
                type='date'
                name='Date'
                value={format(studentData().Date, 'dd/MM/yyyy')}
                placeholder='Enter your Date here'
                onInput={handleInput}
                required
            />
            <button
                class='rounded-lg border-2 border-green-950 bg-green-500 p-1 hover:cursor-pointer'
                type='submit'
            >
                Submit Data
            </button>
            {/* <input */}
            {/*     class='rounded-lg border-2 border-green-950 bg-green-500 p-1 hover:cursor-pointer' */}
            {/*     id='submit_button' */}
            {/*     type='submit' */}
            {/* /> */}
        </form>
    );
}

// render(() => <RetrieveForm />, document.getElementById('form'))
