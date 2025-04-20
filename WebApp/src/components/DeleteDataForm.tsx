import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { createSignal } from 'solid-js';
import type { Student } from '../types';

dayjs.extend(customParseFormat);

export default function DeleteDataForm() {
    const [loading, setLoading] = createSignal(false);
    const [searchLoading, setSearchLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [success, setSuccess] = createSignal<string | null>(null);
    const [confirmDelete, setConfirmDelete] = createSignal(false);
    const [studentId, setStudentId] = createSignal('');
    const [studentData, setStudentData] = createSignal<Student | null>(null);

    function searchStudent() {
        if (!studentId()) {
            setError('Student ID is required');
            return;
        }

        setSearchLoading(true);
        setError(null);
        setSuccess(null);
        setStudentData(null);
        setConfirmDelete(false);

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
                    console.error('Error fetching student:\n', data);
                } else setStudentData(data);
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                console.error('Failed to fetch student:\n', msg);
            } finally { setSearchLoading(false); }
        })()
    }

    function handleDelete() {
        if (!confirmDelete()) {
            setConfirmDelete(true);
            return;
        }

        setLoading(true);
        setError(null);

        (async () => {
            try {
                const response = await fetch(`http://localhost:8080/student/${studentId()}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.error || 'Unknown error occurred.';
                    setError(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
                    alert('Error deleting student');
                    console.error('Error deleting student:', data);
                } else {
                    setSuccess(data.message || 'Student deleted successfully!');
                    setStudentData(null);
                    setStudentId('');
                    setConfirmDelete(false);
                    alert('Student deleted successfully!');
                    console.log('Student deleted successfully!\n', data);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                alert('Failed to delete student');
                console.error('Failed to delete student:\n', msg);
            }
        })()
    }

    return (
        <div class='flex flex-col slate-form'>
            <h1 class='relative text-2xl bottom-2.5'>Delete Student</h1>

            <form class='flex gap-2'>
                <input
                    class='flex-1 rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                    type='text'
                    placeholder='Enter Student ID'
                    value={studentId()}
                    onInput={(e) => setStudentId(e.currentTarget.value)}
                />
                <button
                    class='rounded-lg blue-button'
                    onClick={searchStudent}
                    disabled={searchLoading()}
                >
                    {searchLoading() ? 'Searching...' : 'Search'}
                </button>
            </form>

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

            {studentData() && (<div class='mt-4 p-4 border rounded-lg bg-white'>
                <h2 class='text-xl font-bold mb-4'>Student Details</h2>

                <div class='grid grid-cols-[auto_1fr] gap-2 mb-6'>
                    <div class='font-bold'>ID:</div>
                    <div>{studentData()?.studentID}</div>

                    <div class='font-bold'>Name:</div>
                    <div>{studentData()?.studentName}</div>

                    <div class='font-bold'>Course:</div>
                    <div>{studentData()?.courseName}</div>

                    <div class='font-bold'>Date:</div>
                    <div>{dayjs(studentData()?.Date).format('DD/MM/YYYY')}</div>
                </div>

                <button
                    class={
                        `w-full rounded-lg delete-button
                        ${confirmDelete() ? 'border-red-900 bg-red-700 hover:bg-red-800'
                            : 'border-red-400 bg-red-500 hover:bg-red-600'
                        }`
                    }
                    onClick={handleDelete}
                    disabled={loading()}
                >
                    {loading() ? 'Deleting...' :
                        confirmDelete() ? 'Confirm Delete' : 'Delete Student'}
                </button>

                {confirmDelete() && (<button
                    class='w-full mt-2 rounded-lg confirm-delete-button'
                    onClick={() => setConfirmDelete(false)}
                >
                    Cancel
                </button>)}
            </div>)}
        </div>
    );
}
