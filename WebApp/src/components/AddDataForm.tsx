import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { createSignal } from 'solid-js';
// import { render } from 'solid-js/web';
import type { Student } from '../types';

const stringIsNullOrEmpty = (str: string) => str === null || str === undefined || str === '';

const dateFormat =  'YYYY-MM-DD';

dayjs.extend(customParseFormat)

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

    const [error, setError] = createSignal<string | null>(null);

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const key = target.id as keyof Student;
        // Finally, set student data
        setStudentData(stud => {
            const value = !stringIsNullOrEmpty(target.value) ? target.value : '';
            return {
                ...stud,
                [key]: value,
                Date: dayjs(value, dateFormat).toDate()
            };
        });
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        if (Object.values(studentData()).every(v => v === null))
            console.log('Either all or some properties in `studentData()` were not filled');

        (async () => {
            try {
                const response = await fetch('http://127.0.0.1:8080/student', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...studentData() })
                });

                const data = await response.json();

                if (!response.ok) {
                    const error = data.error || 'Unknown error occurred.';
                    setError(error);
                    alert(`An error occurred\n${error}`);
                    console.error('An error occurred\n', data);
                } else {
                    alert('Student added successfully!');
                    console.log('Student added successfully!\n', data);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                alert('Failed to add student');
                console.error('Failed to add student\n', msg);
            }
        })();
    }

    return (
        <form
            class='rounded-2xl border p-10 w-80 flex flex-wrap flex-col space-y-1 bg-slate-100 border-slate-500 scale-[135%]'
            id='addStudentForm'
            onSubmit={handleSubmit}
        >
            <h1 class='relative text-2xl bottom-2.5'>Add New Student</h1>
            <label for='studentID' id='studdentID_label' class='relative flex flex-col'>
                <div class='leading-6 font-bold'>Student ID</div>
                <input
                    class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                    id='studentID'
                    type='text'
                    name='studentID'
                    value={studentData().studentID}
                    placeholder='Enter your Student ID here'
                    onInput={handleInput}
                    required
                />
            </label>
            <label for='studentName' id='studdentName_label' class='relative flex flex-col'>
                <div class='leading-6 font-bold'>Student Name</div>
                <input
                    class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-slate-500'
                    id='studentName'
                    type='text'
                    name='studentName'
                    value={studentData().studentName}
                    placeholder='Enter your Student Name here'
                    onInput={handleInput}
                    required
                />
            </label>
            <label for='courseName' id='courseName_label' class='relative flex flex-col'>
                <div class='leading-6 font-bold'>Course Name</div>
                <input
                    class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-slate-500'
                    id='courseName'
                    type='text'
                    name='courseName'
                    value={studentData().courseName}
                    placeholder='Enter your Course Name here'
                    onInput={handleInput}
                    required
                />
            </label>
            <label for='Date' id='Date_label' class='relative flex flex-col'>
                <div class='leading-6 font-bold'>Date</div>
                <input
                    class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                    id='Date'
                    type='date'
                    name='Date'
                    value={dayjs(studentData().Date).format(dateFormat)}
                    placeholder='Enter your Date here'
                    onInput={handleInput}
                    required
                />
            </label>
            <button
                class='relative top-2 w-full rounded-lg border-2 border-green-900 bg-green-600 p-1 hover:cursor-pointer hover:bg-green-400 hover:border-green-600 transition-colors'
                type='submit'
            >
                Submit Data
            </button>
            <div is='div' class='font-mono relative text-red-500 leading-10' hidden={error() === null}>
                ERROR: {error()}
            </div>
        </form>
    );
}
