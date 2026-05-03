import React, { useEffect, useState } from 'react';
import '../styles/ViewNote.css';
import { getUserById } from './middleware/user';
import { GetRealEstatePhotos } from './middleware/real-estate-photo';
import { createEstimate } from './middleware/estimate';
import { createResponseCotact } from './middleware/contact';
import { deleteRealEstateQuery, type RealEstateQuery } from './middleware/real-estate-query';
import { createNote, deleteNote, getAllNotesByQueryId, updateNote } from './middleware/note';

function ViewNote({
    selectedNote,
    setToggleNote,
    getAllNotes
} : {
    selectedNote : any;
    setToggleNote : React.Dispatch<React.SetStateAction<boolean>>;
    getAllNotes : Function;
}) {
    const [updateNoteView, setUpdateNoteView] = useState<boolean>(false);
    const [updatedNoteText, setUpdatedNoteText] = useState<string>("");

    const formatIsoString = (value: string) => {
        if (!value || value.trim().length === 0) return '';

        const d = new Date(value);
        if (isNaN(d.getTime())) return value; // fallback: show raw if invalid

        return d.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };
    
    async function updateNoteHandler() {
        if (selectedNote === null) return;

        const updatedNote = await updateNote(selectedNote._id, {note : updatedNoteText})
        if (updatedNote) {
            await getAllNotes();
            setToggleNote(false);
        }
    }

    async function removeNoteHandler() {
        if (selectedNote === null) return;

        const removedNote = await deleteNote(selectedNote._id);
        if (removedNote) {
            await getAllNotes();
            setToggleNote(false);
        }
    }
        
    return (
        <>
            {selectedNote ? <div className='ViewNote'>
                <div className='NoteBackground' onClick={() => {setToggleNote(false)}}></div>
                <div className='ViewNoteContainer'>
                    <div className='ViewNoteContent'>
                        <p>{formatIsoString(selectedNote.createdAt)}</p>

                        <div className='NoteText'>
                            <p>{selectedNote.note}</p>
                        </div>

                        {updateNoteView ? <div className='UpdateNote'>
                            <textarea value={updatedNoteText} onInput={(e) => setUpdatedNoteText(e.currentTarget.value)}/>
                            <button onClick={() => updateNoteHandler()}>Confirm Update</button>
                        </div> : null}

                        <div className='NoteButtons'>
                            <button onClick={() => removeNoteHandler()}>remove</button>
                            <button onClick={() => setUpdateNoteView(!updateNoteView)}>update</button>
                        </div>
                    </div>
                </div>
            </div> : null}
        </>
    )
}

export default ViewNote;
