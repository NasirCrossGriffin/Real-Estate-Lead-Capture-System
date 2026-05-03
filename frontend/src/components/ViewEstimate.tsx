import React, { useEffect, useState } from 'react';
import '../styles/ViewEstimate.css';
import { getUserById } from './middleware/user';
import { GetRealEstatePhotos } from './middleware/real-estate-photo';
import { createEstimate } from './middleware/estimate';
import { createResponseCotact } from './middleware/contact';
import { deleteRealEstateQuery, updateRealEstateQuery, type RealEstateQuery } from './middleware/real-estate-query';
import { createNote, getAllNotesByQueryId } from './middleware/note';
import ViewNote from './ViewNote';

function ViewEstimate({
    loadInquiries,
    realEstateQuery,
    setViewEstimate,
    organization
} : {
    loadInquiries : Function;
    realEstateQuery: any;
    setViewEstimate: React.Dispatch<React.SetStateAction<Boolean>>;
    organization : any
}) {
    const [user, setUser] = useState<any>(null);
    const [realEstateQueryPhotos, setEstimatePhotos] = useState<Array<any>>([]);
    const [realEstateQueryPrice, setEstimatePrice] = useState<string>("");
    const [completedEstimate, setCompletedEstimate] = useState<any>(null);
    const [realEstateQueryPriceValidator, setEstimatePriceValidator] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false)
    const [responseSent, setResponseSent] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [notes, setNotes] = useState<any>([]);
    const [newNote, setNewNote] = useState<boolean>(false);
    const [noteInput, setNoteInput] = useState<string>("");
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [toggleNote, setToggleNote] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("");
    const [followUpDate, setFollowUpDate] = useState<string>("");

    const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_DEV_BASE_URL : import.meta.env.VITE_API_PROD_BASE_URL;

    useEffect(() => {
        console.log(selectedNote)
    }, [selectedNote])

    useEffect(() => {
        console.log(organization);
    }, [organization])

    useEffect(() => {
        async function getAllNotes() {
            setNotes(await getAllNotesByQueryId(realEstateQuery._id));
        } getAllNotes();
    }, [realEstateQuery])

    useEffect(() => {
        switch (realEstateQuery.status) {
            case 'new':
                setStatus("New")
                break;
            case 'contacted':
                setStatus("Contacted")
                break;
            case 'appointment_set':
                setStatus("Appointment Set")
                break;  
            case 'offer_made':
                setStatus("Offer Made")
                break;
            case 'under_contract':
                setStatus("Under Contract")
                break;
            case 'closed':
                setStatus("Closed")
                break;
            case 'dead':
                setStatus("Dead")
                break;
    }}, [realEstateQuery])

    useEffect(() => {
        if (realEstateQuery) {
            const getUser = async () => {
                const foundUser = await getUserById(realEstateQuery.user._id);
                console.log(foundUser);
                setUser(foundUser);
            }; 

            const getAllEstimatePhotos = async () => {
                const realEstateQueryPhotos = await GetRealEstatePhotos(realEstateQuery._id);
                setEstimatePhotos(realEstateQueryPhotos);
            };
            
            getUser(); getAllEstimatePhotos();
        }
    }, [realEstateQuery])

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

    useEffect(() => {
        setFollowUpDate(realEstateQuery.followUpDate)
    }, [realEstateQuery])

    const generateRealEstateResponse = async () => {
        if (!(user && realEstateQuery && organization)) return;

        const newResponseContact = {
            email : user.email,
            firstname : user.firstName,
            service : realEstateQuery.service,
            address : realEstateQuery.address,
            city : realEstateQuery.city,
            state : realEstateQuery.state,
            zipCode : realEstateQuery.zipCode,
            organization : organization._id,
            message : message
        }

        const completedContact = await createResponseCotact(newResponseContact);

        if (completedContact) {
            setLoading(false);
            setResponseSent(true);
        }
    }

    const clickHandler = async () => {
        setLoading(true)
        await generateRealEstateResponse()
    };

    const normalizePriceString = (value: string) => {
    // remove $ and commas and whitespace
    return value.replace(/\$/g, '').replace(/,/g, '').trim();
    };

    const parseEstimatePrice = (value: string) => {
        const normalized = normalizePriceString(value);
        if (normalized.length === 0) return null;

        const num = Number(normalized);
        if (!Number.isFinite(num)) return null;
        if (num < 0) return null;

        return num;
    };

    const validateEstimatePrice = (value: string) => {
        const parsed = parseEstimatePrice(value);
        return parsed === null ? 'Enter a valid numeric price (e.g. 2500 or $2,500)' : '';
    };

    const deleteHandler = async () => {
        const deleted = await deleteRealEstateQuery(realEstateQuery._id)

        if (deleted) {
            loadInquiries();
            setViewEstimate(false);
        }
    }

    async function createNewNote() {
        const protoNote = await createNote({
            realEstateQuery : realEstateQuery._id,
            note : noteInput
        }) 

        if (protoNote) {
            setNotes(await getAllNotesByQueryId(realEstateQuery._id));
            setNewNote(false);
        }
    }

    async function getAllNotes() {
        setNotes(await getAllNotesByQueryId(realEstateQuery._id));
    };

    function toggleNoteHandler(note : any) {
        setSelectedNote(note);
        setToggleNote(true);
    }

    async function updateStatusHandler(value : string) {
        console.log(value)
        switch (value) {
            case 'new':
                setStatus("New")
                break;
            case 'contacted':
                setStatus("Contacted")
                break;
            case 'appointment_set':
                setStatus("Appointment Set")
                break;  
            case 'offer_made':
                setStatus("Offer Made")
                break;
            case 'under_contract':
                setStatus("Under Contract")
                break;
            case 'closed':
                setStatus("Closed")
                break;
            case 'dead':
                setStatus("Dead")
                break;
            
        }
        const updatedQuery = await updateRealEstateQuery(realEstateQuery._id, {status : value});
        console.log(updatedQuery)
        await loadInquiries();
    }

    async function updateFollowUpDate(value: string) {
        console.log(value);
    
        // Parse as LOCAL date (not UTC)
        const [year, month, day] = value.split("-").map(Number);
        const newFollowUpDate = new Date(year, month - 1, day); // local time
    
        const updatedQuery = await updateRealEstateQuery(
            realEstateQuery._id,
            { followUpDate: newFollowUpDate.toISOString() }
        );
    
        setFollowUpDate(newFollowUpDate.toISOString());
    
        console.log(updatedQuery);
        await loadInquiries();
    }

    async function updateFollowUpTime(timeValue: string) {
        if (!realEstateQuery.followUpDate) return;
    
        // Parse existing ISO date
        const existingDate = new Date(followUpDate);
    
        // Extract hours + minutes from input (format: "HH:mm")
        const [hours, minutes] = timeValue.split(":").map(Number);
    
        // Set time using LOCAL time (important)
        existingDate.setHours(hours);
        existingDate.setMinutes(minutes);
        existingDate.setSeconds(0);
        existingDate.setMilliseconds(0);
    
        // Convert back to ISO
        const updatedISO = existingDate.toISOString();
    
        const updatedQuery = await updateRealEstateQuery(
            realEstateQuery._id,
            { followUpDate: updatedISO }
        );

        setFollowUpDate(formatIsoString(updatedISO));
    
        console.log(updatedQuery);
        await loadInquiries();
    }

    return (
        <>
            {toggleNote ? <ViewNote selectedNote={selectedNote} setToggleNote={setToggleNote} getAllNotes={getAllNotes} /> : null}
            {realEstateQuery ? <div className='ViewEstimate'>
                <div className='Background' onClick={() => setViewEstimate(false)}></div>
                <div className='ViewEstimateContainer'>
                    <div className='ContentContainer'>
                        {realEstateQuery && user ? <div className='EstimateInformation'>
                            <div className='EstimateField'>
                                <h3>Request Created At:</h3>
                                <p>{formatIsoString(realEstateQuery.createdAt)}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Appointment Date and Time:</h3>
                                <p>{formatIsoString(realEstateQuery.consultationDate)}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Name:</h3>
                                <p>{user.firstName + " " + user.lastName}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Email:</h3>
                                <p>{user.email}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Phone Number:</h3>
                                <p>{user.phoneNumber}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Address:</h3>
                                <p>{realEstateQuery.address}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>City:</h3>
                                <p>{realEstateQuery.city}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>State:</h3>
                                <p>{realEstateQuery.state}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Zip Code:</h3>
                                <p>{realEstateQuery.zipCode}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Service</h3>
                                <p>{realEstateQuery.service}</p>
                            </div>

                            <div className='EstimateField'>
                                <h3>Facing foreclosure:</h3>
                                <p>{realEstateQuery.facingForeclosure ? "Yes" : "No"}</p>
                            </div>

                            {
                                realEstateQuery.facingForeclosure ? 
                                <>
                                    <div className='EstimateField'>
                                        <h3>Loan Balance:</h3>
                                        <p>{realEstateQuery.currentLoanBalance}</p>
                                    </div> 

                                    <div className='EstimateField'>
                                        <h3>Amount Behind:</h3>
                                        <p>{realEstateQuery.amountBehind}</p>
                                    </div> 

                                    <div className='EstimateField'>
                                        <h3>Loan Type:</h3>
                                        <p>{realEstateQuery.loanType}</p>
                                    </div> 

                                    <div className='EstimateField'>
                                        <h3>Lender Name:</h3>
                                        <p>{realEstateQuery.lenderName}</p>
                                    </div>

                                    <div className='EstimateField'>
                                        <h3>Auction Date:</h3>
                                        <p>{realEstateQuery.auctionDate ? realEstateQuery.auctionDate : "N/A"}</p>
                                    </div>
                                </>: null
                            }
                        </div> : null}

                        <h1>Adjust Status</h1>

                        <h2 className='StatusValue'>{status}</h2>

                        <select className="UpdateStatusSelect" onInput={(e) => updateStatusHandler(e.currentTarget.value)}>
                            <option id="New" value="new">New</option>
                            <option id="Contacted" value="contacted">Contacted</option>
                            <option id ="Appointment Set" value="appointment_set">Appointment Set</option>
                            <option id="Offer Made" value="offer_made">Offer Made</option>
                            <option id="Under Contract" value="under_contract">Under Contract</option>
                            <option id="Closed" value="closed">Closed</option>
                            <option id="Dead" value="dead">Dead</option>
                        </select>

                        <h1>Adjust Follow Up Date</h1>

                        <h2 className='FollowUpDate'>{formatIsoString(followUpDate)}</h2>

                        <input className='InputFollowUpDate' type="date" onInput={(e) => updateFollowUpDate(e.currentTarget.value)}/>
                        <input className='InputFollowUpTime' type="time" onBlur={(e) => updateFollowUpTime(e.currentTarget.value)}/>


                        <h1>Description</h1>

                        {realEstateQuery ? <div className='Description'>
                            <p>{realEstateQuery.description}</p>
                        </div> : null}

                        <div className='EstimatePhotosContainer'>
                            {realEstateQuery && realEstateQueryPhotos.length > 0 ? <div className='EstimatePhotos'>
                                {realEstateQueryPhotos.map((realEstateQueryPhoto, index) => (<div className='EstimatePhoto' key={index}>
                                    <img src={realEstateQueryPhoto.url}/>
                                </div>))}
                            </div> : <h1>No Photos Uploaded</h1>}
                        </div>

                        <div className='LeadCapture'>
                            <h1>Respond to the lead</h1>
                            <textarea value={message} onInput={(e) => {setMessage(e.currentTarget.value)}} />
                            <div>
                                <>{ loading === false && responseSent === false ? <button onClick={() => {clickHandler()}}>Respond</button> : null }</>
                                <>{ loading && responseSent === false ? <div className='LoadingIcon'><img src={`${BASE_URL}/images/loading.png`} /></div> : null }</>
                                <>{ responseSent ? <div className='ResponseSent'><h2 style={{color : "green"}}>Response sent successfully</h2></div> : null }</>
                            </div>
                        </div>

                        {realEstateQueryPriceValidator !== '' ? (
                                <p className="Validator">{realEstateQueryPriceValidator}</p>
                                ) : null}

                        {completedEstimate ? <p className='EstimateSent'>The realEstateQuery was sent to the customer</p> : null}

                        <h1>Notes</h1>

                        <button className="ToggleNoteButton" onClick={() => setNewNote(!newNote)}>New Note</button>

                        { newNote ? <div className='NewNote'>
                            <textarea value={noteInput} onInput={(e) => setNoteInput(e.currentTarget.value)}/>
                            <button onClick={() => {createNewNote()}}>Create New Note</button>
                        </div> : null}

                        <div className='NotesContainer'>
                            {notes.length > 0 ? <div className='NotesGrid'>
                                {
                                    notes.map((note : any, index : number) => (
                                        <div className='Note' onClick={() => toggleNoteHandler(note)}>
                                            <p className='Date'>{formatIsoString(note.createdAt)}</p>
                                            <div className='NotePreview'>{note.note}</div>
                                        </div>
                                    ))
                                }
                            </div> : <p>You haven't created any notes</p>}
                        </div>

                        <button style={{
                            backgroundColor : "red",
                            color : "white",
                            fontFamily : "Montserrat",
                            fontSize : window.innerHeight < window.innerWidth ? "2vw" : "4vw",
                            marginTop : window.innerHeight < window.innerWidth ? "5vw" : "20vw",
                            borderRadius : "35px"
                        }} className='RemoveButton' onClick={() => {deleteHandler()}}>
                            Remove Lead
                        </button>
                    </div>
                </div>
            </div> : null}
        </>
    )
}

export default ViewEstimate;
