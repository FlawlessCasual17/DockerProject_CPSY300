import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createSignal } from 'solid-js';
import type { Student } from '../types';

const stringIsNullOrEmpty = (str: string): boolean => str === null || str === undefined || str === '';

dayjs.extend(customParseFormat);

const dateFormat = 'YYYY-MM-DD';

export default function UpdateDataForm() {
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [success, setSuccess] = createSignal<string | null>(null);
    const [studentId, setStudentId] = createSignal('');
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

        setLoading(true);
        setError(null);
        setSuccess(null);

        (async () => {
            try {
                const response = await fetch(`http://localhost:8080/student/${studentId()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    const error = data.error || 'Unknown error occurred.';
                    setError(Array.isArray(error) ? error.join('\n') : error);
                    console.error('Error fetching student:', data);
                    setFoundStudent(false);
                } else {
                    console.log('Student found successfully!\n', data);
                    setFoundStudent(true);
                    setStudentData(data);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                setFoundStudent(false);
                console.error('Failed to fetch student:', msg);
            } finally { setLoading(false); }
        })()
    }

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const key = target.id as keyof Student;

        setStudentData(prev => {
            const value = !stringIsNullOrEmpty(target.value) ? target.value : '';

            if (key === 'Date') return { ...prev, [key]: dayjs(value, dateFormat).toDate() };

            return { ...prev, [key]: value };
        });
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);

        (async () => {
            try {
                const response = await fetch(`http://localhost:8080/student/${studentId()}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...studentData() })
                });

                const data = await response.json();

                if (!response.ok) {
                    const error = data.error || 'Unknown error occurred.';
                    setError(Array.isArray(error) ? error.join('\n') : error);
                    alert('Error updating student');
                    console.error('Error updating student:\n', data);
                } else {
                    setSuccess('Student updated successfully!');
                    setStudentData(data);
                    alert('Student updated successfully!');
                    console.log('Student updated successfully!\n', data);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                alert('Failed to update student');
                console.error('Failed to update student:\n', msg);
            }
        })()
    }

    return (
        <div class='flex flex-col slate-form'>
            <h1 class='relative text-2xl bottom-2.5'>Update Student</h1>

            <div class='flex gap-2'>
                <input
                    class='flex-1 rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                    type='text'
                    placeholder='Enter Student ID'
                    value={studentId()}
                    onInput={e => setStudentId(e.currentTarget.value)}
                />
                <button
                    class='rounded-lg blue-button'
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
