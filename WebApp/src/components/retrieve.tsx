import { createSignal } from 'solid-js';

// TODO: Add code for creating a UI to manipulate the API of Student API (StudentDB)
export default function Retrieve() {
    const [studentData, setStudentData] = createSignal({
        studentID: '',
        studentName: '',
        courseName: '',
        Date: ''
    });
}
