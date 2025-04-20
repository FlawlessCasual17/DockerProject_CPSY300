import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createSignal } from 'solid-js';
import type { Student } from '../types';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';

export default function UpdateDataForm() {
    const [studentId, setStudentId] = createSignal('');
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [success, setSuccess] = createSignal<string | null>(null);

    const [studentData, setStudentData] = createSignal<Student>({
        studentID: '',
        studentName: '',
        courseName: '',
        Date: new Date()
    });
    const [foundStudent, setFoundStudent] = createSignal(false);

    function searchStudent() {
        if (!studentId()) {
            setError('Please enter a Student ID to search');
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);
                setSuccess(null);

                const response = await fetch(`http://127.0.0.1:8080/student/${studentId()}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.error || 'Unknown error occurred.';
                    setError(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
                    setFoundStudent(false);
                    console.error('Error fetching student:', data);
                } else {
                    setStudentData(data);
                    setFoundStudent(true);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                setFoundStudent(false);
                console.error('Failed to fetch student:', msg);
            } finally {
                setLoading(false);
            }
        })()
    }

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const key = target.id as keyof Student;

        setStudentData(prev => {
            if (key === 'Date') {
                return {
                    ...prev,
                    [key]: dayjs(target.value, dateFormat).toDate()
                };
            }
            return {
                ...prev,
                [key]: target.value
            };
        });
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        (async () => {
            try {
                setLoading(true);
                setError(null);
                setSuccess(null);

                const response = await fetch(`http://127.0.0.1:8080/student/${studentId()}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentData())
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.error || 'Unknown error occurred.';
                    setError(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
                    console.error('Error updating student:', data);
                } else {
                    setSuccess('Student updated successfully!');
                    setStudentData(data);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                console.error('Failed to update student:', msg);
            }
        })()
    }

    return (
        <div class='rounded-2xl border p-6 flex flex-col space-y-4 bg-slate-100 border-slate-500 w-full max-w-lg'>
            <h1 class='text-2xl font-bold'>Update Student</h1>

            <div class='flex gap-2'>
                <input
                    class='flex-1 rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                    type='text'
                    placeholder='Enter Student ID'
                    value={studentId()}
                    onInput={(e) => setStudentId(e.currentTarget.value)}
                />
                <button
                    class='rounded-lg border-2 border-blue-900 bg-blue-600 p-1 px-4 text-white hover:cursor-pointer hover:bg-blue-400 hover:border-blue-600 transition-colors'
                    onClick={searchStudent}
                    disabled={loading()}
                >
                    {loading() && !foundStudent() ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error() && (
                <div class='font-mono text-red-500 p-2 border border-red-300 bg-red-50 rounded'>
                    {error()}
                </div>
            )}

            {success() && (
                <div class='font-mono text-green-600 p-2 border border-green-300 bg-green-50 rounded'>
                    {success()}
                </div>
            )}

            {foundStudent() && (
                <form
                    class='flex flex-col space-y-4 mt-4 p-4 border rounded-lg bg-white'
                    onSubmit={handleSubmit}
                >
                    <h2 class='text-xl font-bold'>Edit Student Details</h2>

                    <label for='studentID' class='flex flex-col'>
                        <div class='leading-6 font-bold'>Student ID</div>
                        <input
                            class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                            id='studentID'
                            type='text'
                            value={studentData().studentID}
                            onInput={handleInput}
                            required
                        />
                    </label>

                    <label for='studentName' class='flex flex-col'>
                        <div class='leading-6 font-bold'>Student Name</div>
                        <input
                            class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                            id='studentName'
                            type='text'
                            value={studentData().studentName || ''}
                            onInput={handleInput}
                            required
                        />
                    </label>

                    <label for='courseName' class='flex flex-col'>
                        <div class='leading-6 font-bold'>Course Name</div>
                        <input
                            class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                            id='courseName'
                            type='text'
                            value={studentData().courseName || ''}
                            onInput={handleInput}
                            required
                        />
                    </label>

                    <label for='Date' class='flex flex-col'>
                        <div class='leading-6 font-bold'>Date</div>
                        <input
                            class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                            id='Date'
                            type='date'
                            value={dayjs(studentData().Date).format(dateFormat)}
                            onInput={handleInput}
                            required
                        />
                    </label>

                    <button
                        class='w-full rounded-lg border-2 border-green-900 bg-green-600 p-1 text-white hover:cursor-pointer hover:bg-green-400 hover:border-green-600 transition-colors'
                        type='submit'
                        disabled={loading()}
                    >
                        {loading() && foundStudent() ? 'Updating...' : 'Update Student'}
                    </button>
                </form>
            )}
        </div>
    );
}
