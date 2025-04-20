import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { createSignal } from 'solid-js';
import type { Student } from '../types';

const stringIsNullOrEmpty = (str: string): boolean => str === null || str === undefined || str === '';

const dateFormat =  'YYYY-MM-DD';

dayjs.extend(customParseFormat)

export default function AddDataForm() {
    const [studentData, setStudentData] = createSignal<Student>(
        {
            studentID: '',
            studentName: '',
            courseName: '',
            Date: new Date()
        }
    );
    const [error, setError] = createSignal<string | null>(null);

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const key = target.id as keyof Student;

        // Finally, set student data
        setStudentData(prev => {
            const value = !stringIsNullOrEmpty(target.value) ? target.value : '';
            return {
                ...prev,
                [key]: value,
                Date: dayjs(value, dateFormat).toDate()
            };
        });
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        (async () => {
            try {
                const response = await fetch('http://localhost:8080/student', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ ...studentData() })
                });

                const data = await response.json();

                if (!response.ok) {
                    const error = data.error || 'Unknown error occurred.';
                    setError(error);
                    alert('An error occurred');
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
            class='flex flex-col flex-wrap slate-form'
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
                    class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
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
                    class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
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
                class='relative top-2 w-full rounded-lg border-2 green-button'
                type='submit'
            >
                Submit Data
            </button>
            {error() && (
                <div class='font-mono text-red-500 p-2 border border-red-300 bg-red-50 rounded'>
                    {error()}
                </div>
            )}
        </form>
    );
}
