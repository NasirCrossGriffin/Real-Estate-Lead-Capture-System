import { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import '../styles/Admin.css'
import { check } from './middleware/admin.ts';
import { getOrganizationByName, updateOrganization } from './middleware/organization.ts';
import { getFilteredRealEstateQueriesByOrganization, getRealEstateQueriesByOrganization, updateRealEstateQuery } from './middleware/real-estate-query.ts';
import { getUserById } from './middleware/user.ts';
import ViewEstimate from './ViewEstimate.tsx';
import { GetRealEstatePhotos } from './middleware/real-estate-photo.ts';
import { ClassNames } from '@emotion/react';

function Admin() {
    const [organization, setOrganization] = useState<any>(null);
    const [inquiries, setInquiries] = useState<any>(null);
    const [users, setUsers] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState<Boolean>(false);
    const [selectedRealEstateQuery, setSelectedRealEstateQuery] = useState(null);
    const [viewEstimate, setViewEstimate] = useState<Boolean>(false);
    const [inquiryPhotoStatus, setInquiryPhotoStatus] = useState<Array<boolean>>([]);
    const [viewNavDrawer, setViewNavDrawer] = useState<boolean>();
    const [webhook, setWebhook] = useState<string>("");
    const [inputWebhook, setInputWebhook] = useState<boolean>(false);
    const [webhookUploaded, setWebhookUploaded] = useState<boolean | null>(null);

    // Filters
    const [inForeclosureOnly, setInForeclosureOnly] = useState(false);
    const [withPhotosOnly, setWithPhotosOnly] = useState(false);
    const [sortByFollowUpDate, setSortByFollowUpDate] = useState(false);
    const [sortByStatus, setSortByStatus] = useState(false);
    const [showUnviewedOnly, setShowUnviewedOnly] = useState(false);

    //Lead metrics
    const [numberOfLeads, setNumberOfLeads] = useState<number>(0);
    const [recentLeads, setRecentLeads] = useState<number>(0);
    const [unseenLeads, setUnseenLeads] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(true);

    const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_DEV_BASE_URL : import.meta.env.VITE_API_PROD_BASE_URL;

    useEffect(() => {
        const setMetrics = async () => {
            if (organization === null) return;

            const baseInquiries = await getRealEstateQueriesByOrganization(organization._id)

            if (baseInquiries.length === 0) return ;
            //Set Number of leads
            setNumberOfLeads(baseInquiries.length)

            //set recent leads
            const todaysDate = new Date();
            let numRecentLeads = 0;

            for (const inquiry of baseInquiries) {
                const createdAt = new Date(inquiry.createdAt);
                const timeDifference = Math.abs(todaysDate.valueOf() - createdAt.valueOf()); 
                if (timeDifference < 259200000) numRecentLeads = numRecentLeads + 1;
            }

            setRecentLeads(numRecentLeads);

            //set unseen leads
            let numUnseenLeads = 0;

            for (const inquiry of baseInquiries) {
                if (inquiry.viewed === false) numUnseenLeads = numUnseenLeads + 1;
            }

            setUnseenLeads(numUnseenLeads);

        }; setMetrics();
    }, [organization])
    
    useEffect(() => {
        console.log(organization)
        async function getFilteredResults() {
            const filteredQueries = await getFilteredRealEstateQueriesByOrganization(
                organization._id,
                {
                    inForeclosureOnly,
                    withPhotosOnly,
                    sortByFollowUpDate,
                    sortByStatus,
                    showUnviewedOnly,
                }
            );

            setInquiries(filteredQueries)
        } getFilteredResults();
    }, [inForeclosureOnly, withPhotosOnly, sortByFollowUpDate, sortByStatus, showUnviewedOnly])

    useEffect(() => {
        const validateAdmin = async () => { 
            if (organization === null) return;
             
            try {
                const validateAdmin = await check(organization._id.toString());

                if (!(validateAdmin)) {
                    console.log("Verification failed")
                    navigate(`/admin/login`, { replace: true });
                }

                setIsAdmin(true);
                console.log("Validation Successful")
                
                return
            } catch(err) {
                console.log(err);
                setIsAdmin(false);
                navigate(`/admin/login`, { replace: true });
                return
            }
        }; 
        
        validateAdmin();
    }, [organization])

    useEffect(() => {
        async function getInquiries() {
            const protoInquiries = await getRealEstateQueriesByOrganization(organization._id);
            console.log(protoInquiries)
            setInquiries(protoInquiries);
        }; getInquiries();
    }, [isAdmin])

    useEffect(() => {
        setLoading(true)

        const getOrganization = async () => {
            const protoOrganization = await getOrganizationByName("test");
            console.log(protoOrganization)
            setOrganization(protoOrganization);

            return;
        }; getOrganization();
    }, [])

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

    const clickHandler = async (index : number) => {
        setSelectedRealEstateQuery(inquiries[index]);
        setViewEstimate(true);
        await updateRealEstateQuery(inquiries[index]._id, {viewed : true})
        await loadInquiries();
    }

    const navigate = useNavigate();

    async function loadInquiries() {
        const protoInquiries = await getFilteredRealEstateQueriesByOrganization(
            organization._id,
            {
                inForeclosureOnly,
                withPhotosOnly,
                sortByFollowUpDate,
                sortByStatus,
                showUnviewedOnly,
            }
        );
        console.log(protoInquiries)
        setInquiries(protoInquiries);
    }; 

    function setStatusColor(status : string) {
        switch (status) {
            case "new":
                return "blue";
                break;
            case "contacted":
                return "yellow";
                break;
            case "appointment_set":
                return "orange";
                break;
            case "under_contract":
                return "pink";
                break;
            case "closed":
                return "green";
                break;
            case "offer_made":
                return "purple";
                break;
            case "dead":
                return "red";
                break;
        } return "grey";
    }

    function getFollowUpColor(isoString: string): "green" | "yellow" | "orange" | "red" {
        const target = new Date(isoString);
        const now = new Date();
      
        // Normalize both dates to midnight to compare only by date
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      
        const diffMs = targetDate.getTime() - today.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
        if (diffDays < 0) return "red";        // past date
        if (diffDays === 0) return "orange";   // today
        if (diffDays <= 3) return "yellow";    // within 3 days
        return "green";                        // more than 3 days away
    }

    async function populateHasPhotos() {
        const hasPhotos = [];
        for (const inquiry of inquiries) {
            const inquiryPhotos = await GetRealEstatePhotos(inquiry._id);

            if (inquiryPhotos.length > 0) {
                hasPhotos.push(true);
                continue;
            }

            hasPhotos.push(false);
        }

        console.log(hasPhotos)

        setInquiryPhotoStatus(hasPhotos);
    }



    useEffect(() => {
        async function getUsers() {
            const protoUsers = [];

            for (const inquiry of inquiries) {
                const protoUser = await getUserById(inquiry.user._id.toString());
                protoUsers.push(protoUser);
            }

            console.log(protoUsers);
            setUsers(protoUsers);
        }; getUsers(); populateHasPhotos(); 
    }, [inquiries])

    useEffect(() => {
        if (users) setLoading(false);
    }, [users])

    async function linkCRM() {
        const updatedOrganization = await updateOrganization(
            organization._id,
            {webhook : webhook}
        )

        setOrganization(updatedOrganization);

        if (updatedOrganization) {
            setWebhookUploaded(true);
            setInputWebhook(false);
        } else {
            setWebhookUploaded(false);
        }
    }

    return (
        <>
            {viewEstimate ? <ViewEstimate loadInquiries={loadInquiries} realEstateQuery={selectedRealEstateQuery} setViewEstimate={setViewEstimate} organization={organization} /> : null}
            <div className="AdminNav">
                <div className='NavDrawerButton' onClick={() => setViewNavDrawer(!viewNavDrawer)}>
                    <span style={{backgroundColor : viewNavDrawer ? "black" : "white"}}></span>
                    <span style={{backgroundColor : viewNavDrawer ? "black" : "white"}}></span>
                    <span style={{backgroundColor : viewNavDrawer ? "black" : "white"}}></span>
                </div>
                {organization ? 
                <div className='Logo'>
                    <img src={organization.logo} />
                </div> : null}
                {
                    viewNavDrawer ? <div className='NavDrawer'>
                        <div className='NavDrawerBackground' onClick={() => {setViewNavDrawer(!viewNavDrawer)}}></div>
                        <div className='NavDrawerContainer'>
                            <div className='FilterOptions'>
                                <button style={{backgroundColor : inForeclosureOnly ? "green" : "black"}} onClick={() => setInForeclosureOnly(v => !v)}>
                                    In Foreclosure
                                </button>

                                <button style={{backgroundColor : withPhotosOnly ? "green" : "black"}} onClick={() => setWithPhotosOnly(v => !v)}>
                                    With Photos
                                </button>

                                <button style={{backgroundColor : sortByFollowUpDate ? "green" : "black"}} onClick={() => setSortByFollowUpDate(v => !v)}>
                                    Sort By Follow Up Date
                                </button>

                                <button style={{backgroundColor : sortByStatus ? "green" : "black"}} onClick={() => setSortByStatus(v => !v)}>
                                    Sort By Status
                                </button>

                                <button style={{backgroundColor : showUnviewedOnly ? "green" : "black"}} onClick={() => setShowUnviewedOnly(v => !v)}>
                                    Show Unviewed Only
                                </button>
                            </div>
                        </div>
                    </div> : null
                }
            </div>
            {inquiries && loading === false ? <div className='AdminDashboard'>
                <div className='CRMIntegration'>
                    <div className='CRMContainer'>
                        <button onClick={() => setInputWebhook(!inputWebhook)}>Integrate CRM</button>
                        {
                            inputWebhook ? <div>
                                <input placeholder='Enter Zapier Webhook'/>
                                <button onClick={() => linkCRM()}>Confirm</button>
                            </div> : null
                        }
                    </div>
                    {
                        webhookUploaded !== null ? <div className='WebhookStatus'>
                            {
                                webhookUploaded === true ? <p style={{color : "green"}}>Webhook attatched successfully</p> : <p style={{color : "red"}}>Webhook attatchment failed</p>
                            }
                        </div> : null
                    }
                </div>

                <div className='Metrics'>
                    <div className='Metric'>
                        <span className='MetricName'>Number of Leads</span>
                        <span className='MetricValue'>{numberOfLeads}</span>
                    </div>

                    <div className='Metric'>
                        <span className='MetricName'>Recent Leads</span>
                        <span className='MetricValue'>{recentLeads}</span>
                    </div>

                    <div className='Metric'>
                        <span className='MetricName'>Unseen Leads</span>
                        <span className='MetricValue'>{unseenLeads}</span>
                    </div>
                </div>

                <div className='EstimateContainer'>
                    {
                        inquiries.length > 0 && users && users.length > 0 && inquiryPhotoStatus.length > 0 ? inquiries.map((inquiry : any, index : number) => (
                            <div className='Estimate' style={{borderColor: inquiry.viewed ? "black" : "rgb(0, 102, 255)", borderStyle: "solid", borderWidth: "2px", boxShadow: inquiry.viewed ? "0px 0px 0px 0px rgb(0, 0, 0, 0)" : "0px 0px 20px 10px rgb(0, 102, 255)" }} onClick={() => {clickHandler(index)}}>
                                {users.length > 0 ? <p>{users[index] ? (users[index].firstName + " " + users[index].lastName) : null}</p> : null}
                                <p>Looking to {inquiry.service}</p>
                                <p>{formatIsoString(inquiry.createdAt)}</p>
                                <p>facing foreclosure: {(inquiry.facingForeclosure).toString()}</p>
                                <p style={{color : setStatusColor(inquiry.status)}}>{inquiry.status}</p>
                                <p style={{color : getFollowUpColor(inquiry.followUpDate)}}>{formatIsoString(inquiry.followUpDate)}</p>
                                <p style={{color : inquiryPhotoStatus[index] ? "green" : "white"}}>{inquiryPhotoStatus[index] ? "Has Photos" : "No Photos"}</p>
                            </div>                     
                        )) : <div>
                            <p>No Inquiries Yet</p>
                        </div>
                    }
                </div>
            </div>  
            
            : 
            
            <div className='LoadingAdmin'>
                <div className='LoadingIconAdmin'>
                    <img src={`${BASE_URL}/images/loading.png`}/>
                </div>
            </div>}
        </>
    )
}




    export default Admin;
