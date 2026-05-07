import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/IngestionPage.css'
import '../styles/IngestionPage-Moblie.css'

import { getOrganizationByName } from './middleware/organization';
import { createUser } from './middleware/user';
import AppointmentDatePicker from './DatePicker';
import { uploadToS3 } from './middleware/s3';
import { CreateRealEstatePhoto } from './middleware/real-estate-photo';
import { CreateRealEstateQuery } from './middleware/real-estate-query';
import { newContact } from './middleware/contact';
import LegalFooter from './LegalFooter';
import dayjs, { Dayjs } from "dayjs";


function IngestionPage() {
    const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_DEV_BASE_URL : import.meta.env.VITE_API_PROD_BASE_URL;

    const { serviceParam } = useParams();
    const navigate = useNavigate();


    const FormState = [
        'Driver Information',
        'Vehicle Information',
        'Damage Description',
        'Photo Upload',
        'Insurance Information',
        'Appointment Date Selection',
        'Confirmation'
    ]

    const [organization, setOrganization] = useState<any>(null);
    const [service, setService] = useState<String>('')

    const [formState] = useState<Array<string>>(FormState);
    const [formIndex, setFormIndex] = useState<number>(0);
    const [vehicleFormIndex, setVehicleFormIndex] = useState<number>(0);

    // input states
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const [address, setAddress] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [zipcode, setZipCode] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [loanBalance, setLoanBalance] = useState<string>('');
    const [amountBehind, setAmountBehind] = useState<string>('');
    const [loanType, setLoanType] = useState<string>('');
    const [auctionDate, setAuctionDate] = useState<string>('');
    const [lenderName, setLenderName] = useState<string>('');
    const [facingForeclosure, setFacingForeclosure] = useState<boolean | null>(null);
    const [validService, setValidService] = useState<boolean | null>(null);

    // validator states
    const [firstNameValidator, setFirstNameValidator] = useState<string>('');
    const [lastNameValidator, setLastNameValidator] = useState<string>('');
    const [phoneNumberValidator, setPhoneNumberValidator] = useState<string>('');
    const [emailValidator, setEmailValidator] = useState<string>('');
    const [appointmentValidator, setAppointmentValidator] = useState<string>('');

    const [addressValidator, setAddressValidator] = useState<string>('');
    const [cityValidator, setCityValidator] = useState<string>('');
    const [stateValidator, setStateValidator] = useState<string>('');
    const [zipCodeValidator, setZipCodeValidator] = useState<string>('');
    const [loanBalanceValidator, setLoanBalanceValidator] = useState<string>('');
    const [amountBehindValidator, setAmountBehindValidator] = useState<string>('');
    const [loanTypeValidator, setLoanTypeValidator] = useState<string>('');
    const [lenderNameValidator, setLenderNameValidator] = useState<string>('');
    const [auctionDateValidator, setAuctionDateValidator] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [insuranceProviderValidator, setInsuranceProviderValidator] = useState<string>('');
    const [policyNumberValidator, setPolicyNumberValidator] = useState<string>('');
    const [user, SetUser] = useState<any>();
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [description, setDescription] = useState<string>('');
    const [isoString, setIsoString] = useState<string>("");
    const [usingInsurance, setUsingInsurance] = useState<Boolean | null>(null);
    const [realEstateQuery, setRealEstateQuery] = useState<any>(null);
    const [dt, setDt] = useState<Dayjs | null>(dayjs());
    const [loading, setLoading] = useState<boolean>(true);
    const [screenHeight, setScreenHeight] = useState<number>(0);

     useEffect(() => {
        setLoading(false);

        if (service.toLocaleLowerCase() === 'sell' || 
        service.toLocaleLowerCase() === 'buy' || 
        service.toLocaleLowerCase() === 'invest') {
            if (service !== 'sell') {
                setFacingForeclosure(false)
                setAddress("N/A")
            }

            setValidService(true);
            return;
        }

        setValidService(false);
     }, [service])


    useEffect(() => {
        const getorganization = async () => {
            const protoorganization = await getOrganizationByName("test");
            console.log(protoorganization)
            setOrganization(protoorganization);

            return;
        }; 
        
        const getService = async () => {
            console.log(serviceParam)
            switch (serviceParam?.toLowerCase()) {
                case "sell":
                    setService("sell")
                    break;
                case "buy":
                    setService("buy")
                    break;
                case "invest":
                    setService("invest")  
                    break;
                default:
                    // Code to execute if no matches are found
            }
        };

        getorganization();
        getService();
        console.log(BASE_URL);
    }, [])

    useEffect(() => {
        generateUrlPreviews();
    }, [uploadedFiles]);

    useEffect(() => {
        if (user !== null) createNewInquiry();
    }, [user])

    useEffect(() => {
        if (realEstateQuery !== null) createContact();
    }, [realEstateQuery])

    useEffect(() => {
        if (facingForeclosure === false && facingForeclosure !== null) {
            setLoanBalance("N/A")
            setAmountBehind("N/A")
            setLoanType("N/A")
            setLenderName("N/A")
            setAuctionDate("N/A")
        }
    }, [facingForeclosure])
    
    function generateUrlPreviews() {
        var newURL = null;
        var previews = [];

        if (uploadedFiles.length === 0) return;
        
        setPreviewUrls([]);

        for (let file of uploadedFiles) {
            newURL = URL.createObjectURL(file);
            previews.push(newURL);
        }

        setPreviewUrls(previews);
    }

    const validateFirstName = (value: string) =>
        value.trim().length > 0 ? '' : 'First name is required';

    const validateLastName = (value: string) =>
        value.trim().length > 0 ? '' : 'Last name is required';

    const validatePhoneNumber = (value: string) =>
        value.trim().length > 0
        ? /^\+?[\d\s().-]{7,}$/.test(value.trim())
        ? ''
        : 'Enter a valid phone number'
        : 'Phone number is required';

    const validateEmail = (value: string) =>
        value.trim().length > 0
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ''
        : 'Enter a valid email'
        : 'Email is required';

    const validateAddress = (value: string) =>
        value.trim().length > 0 ? '' : 'Address is required';

    const validateCity = (value: string) =>
        value.trim().length > 0 ? '' : 'City is required';

    const validateState = (value: string) =>
        value.trim().length > 0
            ? /^[A-Za-z]{2}$/.test(value.trim())
            ? ''
            : 'Enter a valid 2-letter state code'
            : 'State is required';

    const validateZipCode = (value: string) =>
        value.trim().length > 0
            ? /^\d{5}(-\d{4})?$/.test(value.trim())
            ? ''
            : 'Enter a valid ZIP code'
            : 'ZIP code is required';

    const validateLoanBalance = (value: string) =>
        value.trim().length > 0
            ? !isNaN(Number(value.trim())) && Number(value.trim()) >= 0
            ? ''
            : 'Enter a valid loan balance'
            : 'Current loan balance is required';

    const validateAmountBehind = (value: string) =>
        value.trim().length > 0
            ? !isNaN(Number(value.trim())) && Number(value.trim()) >= 0
            ? ''
            : 'Enter a valid amount behind'
            : 'Amount behind is required';

    const validateLoanType = (value: string) =>
        value.trim().length > 0 ? '' : 'Loan type is required';

    const validateLenderName = (value: string) =>
        value.trim().length > 0 ? '' : 'Lender name is required';

    const validateAuctionDate = (value: string) =>
        value.trim().length === 0
            ? ''
            : !isNaN(new Date(value).getTime())
            ? ''
            : 'Enter a valid auction date';

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

    // one massive validator method
    const runAllValidators = () => {
        const fn = validateFirstName(firstName);
        const ln = validateLastName(lastName);
        const pn = validatePhoneNumber(phoneNumber);
        const em = validateEmail(email);

        const addr = validateAddress(address);
        const cty = validateCity(city);
        const st = validateState(state);
        const zip = validateZipCode(zipcode);

        const lb = validateLoanBalance(loanBalance);
        const ab = validateAmountBehind(amountBehind);
        const lt = validateLoanType(loanType);
        const lender = validateLenderName(lenderName);
        const auction = validateAuctionDate(auctionDate);

        setFirstNameValidator(fn);
        setLastNameValidator(ln);
        setPhoneNumberValidator(pn);
        setEmailValidator(em);

        setAddressValidator(addr);
        setCityValidator(cty);
        setStateValidator(st);
        setZipCodeValidator(zip);

        setLoanBalanceValidator(lb);
        setAmountBehindValidator(ab);
        setLoanTypeValidator(lt);
        setLenderNameValidator(lender);
        setAuctionDateValidator(auction);

        return (facingForeclosure ? !(
            fn ||
            ln ||
            pn ||
            em ||
            addr ||
            cty ||
            st ||
            zip ||
            lb ||
            ab ||
            lt ||
            lender ||
            auction
        ) : !(
            fn ||
            ln ||
            pn ||
            em ||
            addr ||
            cty ||
            st ||
            zip
        ));
    };

    async function createNewUser() {
        if (!(organization)) return;

        const protoUser = {
            firstName : firstName,
            lastName : lastName,
            email : email,
            phoneNumber : phoneNumber,
            organization : organization._id
        }

        console.log(protoUser)

        const newUser = await createUser(protoUser);

        console.log(newUser)

        SetUser(newUser);

        return;
    }


    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e) return;

        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFiles((prev) => [...prev, file]);

        e.target.value = '';
    };

    async function createNewInquiry() {
        if (!(organization && user)) return;

        console.log("organization and User present")

        if (facingForeclosure === null) setFacingForeclosure(false);
            
        if (facingForeclosure !== null) {
            const protoInquiry = {
                organization : organization._id,
                user : user._id,
                address : address,
                city : city,
                state : state,
                zipCode : zipcode,
                facingForeclosure : facingForeclosure,
                currentLoanBalance : loanBalance === 'N/A' ? null : loanBalance,
                amountBehind : amountBehind === 'N/A' ? null : amountBehind,
                loanType : loanType === 'N/A' ? null : loanType,
                lenderName : lenderName === 'N/A' ? null : lenderName,
                auctionDate : auctionDate === 'N/A' ? null : auctionDate,
                description : description,
                consultationDate : isoString,
                service : service.toLowerCase()
            }
            
            console.log(uploadedFiles)

            console.log(protoInquiry)

            const newQuery = await CreateRealEstateQuery(protoInquiry)

            if (!(newQuery)) return;

            await uploadRealEstatePhotos(newQuery._id)

            setRealEstateQuery(newQuery);
        }
    }

    function autofill() {
        setFirstName('Nasir');
        setLastName('Griffin');
        setEmail("nasircrossgriffin@gmail.com");
        setPhoneNumber("609-805-9113");

        setAddress("7427 Rogers Avenue")
        setCity("Pennsaueken")
        setState("NJ")
        setZipCode("08109")
        setDescription("I would like to sell my house")
        setFacingForeclosure(true)
        setLoanBalance("400000")
        setAmountBehind("100000")
        setLoanType("conventional")
        setLenderName("Freddie Mac")
        setAuctionDate('')
        setIsoString("2026-12-02T00:00:00+00:00");
    }

    async function uploadRealEstatePhotos(queryid : string) {
        console.log(queryid);

        for (let file of uploadedFiles) {
            await realEstatePhotoHelper(file, queryid);
        }
    } 

    async function realEstatePhotoHelper(file : File, queryid : string) {
        if (!(file)) return

        const s3URL = await uploadToS3(file);

        console.log(s3URL)

        if (!(s3URL)) return

        const newQueryPhoto = await CreateRealEstatePhoto(
            {
                realEstateQuery: queryid,
                url: s3URL.url
            }
        )

        console.log(newQueryPhoto);
    }

    async function submitInquiry() {
        autofill();

        const validated = runAllValidators();

        console.log(validated);

        if (!(validated)) return;

        setLoading(true);

        await createNewUser()
    }

    async function createContact() {
        const contactCompleted = await newContact({
            email : user.email,
            firstname : user.firstName,
            lastname : user.lastName,
            organization : organization._id,
            address : realEstateQuery.address,
            city : realEstateQuery.city,
            state : realEstateQuery.state,
            zipCode : realEstateQuery.zipCode,
            facingForeclosure : realEstateQuery.facingForeclosure,
            currentLoanBalance : realEstateQuery.currentLoanBalance,
            amountBehind : realEstateQuery.amountBehind,
            loanType : realEstateQuery.loanType,
            lenderName : realEstateQuery.lenderName,
            auctionDate : realEstateQuery.auctionDate,
            service : realEstateQuery.service
        })

        console.log(contactCompleted)

        if (contactCompleted) navigate(`/gratitude`, { replace: true });
    }

    function serviceMessage() {
        if (service === "Sell".toLowerCase()) return "We can help you sell your property"

        if (service === "Buy".toLowerCase()) return "We can help you buy a home"

        if (service === "Invest".toLowerCase()) return "We can help you make a great investment"

        return "Invalid Service Selection"
    }

    function removeImage(index : number) {
        console.log(index);

        var fileList = []
        var iter = 0;

        for (let file of uploadedFiles) {
            if (iter !== index) fileList.push(file);

            iter++;
        }

        console.log(fileList);

        console.log(uploadedFiles)

        setUploadedFiles(fileList);
    }

    async function serviceClickHandler(value : string) {
        await setService('');
        await setService(value);
    }

    function iteratePage() {
        if (formIndex === FormState.length - 1) return;

        if (formIndex === 2) {
            if (service !== 'sell'.toLowerCase()) {
                setFormIndex(5);
                return;
            }
        } 
            
        setFormIndex(formIndex + 1)
    }

    function decrementPage() {
        if (formIndex === 0) {
            setValidService(false);
            return
        }

        if (formIndex === 5) {
            if (service !== 'sell'.toLowerCase()) {
                setFormIndex(2);
                return;
            }
        } 
            
        setFormIndex(formIndex - 1)
    }


    return (
        <>
            {loading === false && validService === true ? <div className='IngestionPage'>
            <div className='SystemBackground'>
                <div className='SystemBackgroundOverlay'></div>
                <div className='SystemBackgroundImage'><img src={`${BASE_URL}/images/background.jpg`} /></div>
            </div>

            <div className='NavBar'>
                <div className='NavContainer'>
                    <button
                        className='NavButton Back'
                        onClick={() => decrementPage()}
                    >
                        Back
                    </button>

                    {organization ? <div className='Logo'>
                        <img src={organization.logo} />
                    </div> : null}

                    <button
                        className='NavButton Continue'
                        onClick={() => iteratePage()}
                    >
                        Continue
                    </button>
                </div>
            </div>

            <div className='ProgressBar'><div className='Progress' style={{width : ((formIndex/6) * 100).toString().concat('%')}}></div></div>
                {  
                    formIndex === 0 ?
                        <div className='CustomerInformation fade-in-slide-up'>
                            <h1>{serviceMessage()}</h1>

                            <h2>Let's get some information about you</h2>

                            <div className='NameFields'>
                                <div className='NameField'>
                                    <label htmlFor='FirstName'>First Name</label>
                                    <input
                                        placeholder='First Name'
                                        type='text'
                                        name='FirstName'
                                        value={firstName}
                                        onInput={(e) => setFirstName(e.currentTarget.value)}
                                    />
                                </div>

                                <div className='NameField'>
                                    <label htmlFor='LastName'>Last Name</label>
                                    <input
                                        placeholder='Last Name'
                                        type='text'
                                        name='LastName'
                                        value={lastName}
                                        onInput={(e) => setLastName(e.currentTarget.value)}
                                    />
                                </div>
                            </div>

                            <div className='ContactFields'>
                                <div className='ContactField'>
                                    <label htmlFor='PhoneNumber'>Phone Number</label>
                                    <input
                                        placeholder='Phone Number'
                                        type='text'
                                        name='PhoneNumber'
                                        value={phoneNumber}
                                        onInput={(e) => setPhoneNumber(e.currentTarget.value)}
                                    />
                                    <p>* Phone number is used to contact qualified inquirers with requested services</p>
                                </div>

                                <div className='ContactField'>
                                    <label htmlFor='Email'>Email</label>
                                    <input
                                        placeholder='Email'
                                        type='email'
                                        name='Email'
                                        value={email}
                                        onInput={(e) => setEmail(e.currentTarget.value)}
                                    />
                                    <p>* Email is used to contact qualified inquirers with requested services</p>
                                </div>
                            </div>
                        </div>
                    : null
                }

                {
                    formIndex === 1 ?
                        <div className='VehicleInformation fade-in-slide-up'>
                            {service === "sell".toLocaleLowerCase() ? <h1>Let's Get Some Information About Your Property</h1> : null}
                            {service === "buy".toLocaleLowerCase() ? <h1>Where are you interested in buying?</h1> : null}
                            {service === "invest".toLocaleLowerCase() ? <h1>Where are you interested in investing?</h1> : null}

                            <div className='InputGrid'>
                                {service === "sell".toLocaleLowerCase() ? <div className='PropertyInput'>
                                    <label htmlFor='address'>Address</label>
                                    <input placeholder='Address' name='address' value={address} onInput={(e) => {setAddress(e.currentTarget.value)}}/>
                                </div> : null}
                       
                                <div className='PropertyInput'>
                                    <label htmlFor='city'>City</label>
                                    <input placeholder='City' name='city' value={city} onInput={(e) => {setCity(e.currentTarget.value)}}/>
                                </div>
                  
                                <div className='PropertyInput'>
                                    <label htmlFor='state'>State</label>
                                    <input placeholder='State' name='state' value={state} onInput={(e) => {setState(e.currentTarget.value)}}/>
                                </div>
          
                                <div className='PropertyInput'>
                                    <label htmlFor='zipcode'>Zip Code</label>
                                    <input placeholder='Zip Code' name='zipcode' value={zipcode} onInput={(e) => {setZipCode(e.currentTarget.value)}}/>
                                </div>
                            </div>
                        </div>
                    : null
                }

                {
                    formIndex === 2 ?
                        <div className='DamageDescriptionPage fade-in-slide-up'>
                            <div className='DamageDescriptionContainer'>
                                <h1>Give us a bit of information about your situation</h1>

                                <textarea
                                    placeholder='Describe the situation with your property...'
                                    value={description}
                                    onInput={(e) => setDescription(e.currentTarget.value)}
                                ></textarea>

                            </div>
                        </div> 
                    : null
                }

                {
                    formIndex === 3 ?
                        <div className='PhotoUploadPage fade-in-slide-up'>
                            <div className='PhotoUploadContainer'>
                                <h1>Please upload photos of the property</h1>

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelected}
                                />

                                <button className='UploadButton' onClick={handleUploadButtonClick}>
                                    {/*<img src={BASE_URL + '/images' + '/upload.png'} />*/}
                                    <img src={`${BASE_URL}/images/upload.png`} />
                                </button>
                                
                                <div className='UploadedPhotosContainer fade-scroll'> 
                                    <div className='UploadedPhotosGrid'>
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className='UploadedPhoto' onClick={() => removeImage(index)}>
                                                <img src={url} alt="Uploaded preview" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div> 
                    : null
                }

                {
                    formIndex === 4 ?
                        <div className='InsuranceInformation fade-in-slide-up'>
                            <h1>Foreclosure Help</h1>
                            
                            <div className='InsuranceInquiry'>
                                <h2>Are you currently facing foreclosure?</h2>
                                <div className='InquiryButtons'>
                                    <button className='InquiryButton' onClick={() => {setFacingForeclosure(true)}}>Yes</button>
                                    <button className='InquiryButton' onClick={() => {setFacingForeclosure(false)}}>No</button>
                                </div>
                            </div>

                            {facingForeclosure ? <div className='InsuranceProvider fade-in-slide-up'>
                                <h2>Don't Worry. We can help</h2>
                                    <div className='InputGrid'>
                                        <div className='PropertyInput'>
                                            <label htmlFor='loanBalance'>Loan Balance</label>
                                            <input placeholder='Loan Balance' name='loanBalance' value={loanBalance} onInput={(e) => {setLoanBalance(e.currentTarget.value)}}/>
                                        </div>
                            
                                        <div className='PropertyInput'>
                                            <label htmlFor='amountBehind'>Amount Behind</label>
                                            <input placeholder='Amount Behind' name='amountBehind' value={amountBehind} onInput={(e) => {setAmountBehind(e.currentTarget.value)}}/>
                                        </div>
                        
                                        <div className='PropertyInput'>
                                            <label htmlFor='loanType'>Loan Type</label>
                                            <select name='loanType' value={loanType} onInput={(e) => {setLoanType(e.currentTarget.value)}}>
                                                <option value=''>Select a type</option>
                                                <option value="convential">Conventional</option>
                                                <option value="fha">Fha</option>
                                                <option value="vha">Vha</option>
                                                <option value="usda">Usda</option>
                                                <option value="jumbo">Jumbo</option>
                                                <option value="heloc">Heloc</option>
                                                <option value="hard_money">Hard Money</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                
                                        <div className='PropertyInput'>
                                            <label htmlFor='lenderName'>Lender Name</label>
                                            <input placeholder='Lender Name' name='lenderName' value={lenderName} onInput={(e) => {setLenderName(e.currentTarget.value)}}/>
                                        </div>

                                        <div className='PropertyInput'>
                                            <label htmlFor='auctionDate'>Auction Date (If Applicable)</label>
                                            <input name='auctionDate' placeholder='Auction Date' type="date" value={auctionDate} onInput={(e) => {setAuctionDate(e.currentTarget.value)}}/>
                                        </div>
                                    </div>
                                </div> : null}  
                        </div>
                    : null
                }

                {
                    formIndex === 5 ?
                        <div className='SelectAppointmentDate fade-in-slide-up'>
                            <div className='SelectAppointmentDateContainer'>
                                <h1>Select a date and time for your consultation</h1>

                                <div className='DatePicker'>
                                    <AppointmentDatePicker setIsoString={setIsoString} dt={dt} setDt={setDt}/>
                                </div>
                            </div>
                        </div> 
                    : null
                }

                {
                    formIndex === 6 ? <div className='ConfirmationPage fade-in-slide-up'>
                            <h1>Review and Confirm</h1>

                            <button
                                className='ConfirmButton'
                                onClick={() => {submitInquiry()}}
                            >
                                Confirm
                            </button>

                            <div className='ReviewItem'>
                                <strong>Consultation:</strong> {formatIsoString(isoString)}
                                {appointmentValidator !== '' ? <p className='Validator'>{appointmentValidator}</p> : null}
                            </div>
                            
                            <div className='Review'>
                                <div className='ReviewItem'>
                                    <strong>First Name:</strong> {firstName}
                                    {firstNameValidator !== '' ? <p className='Validator'>{firstNameValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Last Name:</strong> {lastName}
                                    {lastNameValidator !== '' ? <p className='Validator'>{lastNameValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Phone Number:</strong> {phoneNumber}
                                    {phoneNumberValidator !== '' ? <p className='Validator'>{phoneNumberValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Email:</strong> {email}
                                    {emailValidator !== '' ? <p className='Validator'>{emailValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Address:</strong> {address}
                                    {addressValidator !== '' ? <p className='Validator'>{addressValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>City:</strong> {city}
                                    {cityValidator !== '' ? <p className='Validator'>{cityValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>State:</strong> {state}
                                    {stateValidator !== '' ? <p className='Validator'>{stateValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Zip Code:</strong> {zipcode}
                                    {zipCodeValidator !== '' ? <p className='Validator'>{zipCodeValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Loan Balance:</strong> {loanBalance}
                                    {loanBalanceValidator !== '' ? <p className='Validator'>{loanBalanceValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Amount Behind:</strong> {amountBehind}
                                    {amountBehindValidator !== '' ? <p className='Validator'>{amountBehindValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Loan Type:</strong> {loanType}
                                    {loanTypeValidator !== '' ? <p className='Validator'>{loanTypeValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Lender Name:</strong> {lenderName}
                                    {lenderNameValidator !== '' ? <p className='Validator'>{lenderNameValidator}</p> : null}
                                </div>

                                <div className='ReviewItem'>
                                    <strong>Auction Date:</strong> {auctionDate}
                                    {auctionDateValidator !== '' ? <p className='Validator'>{auctionDateValidator}</p> : null}
                                </div>
                            </div>

                            <div className='Space'>
                            </div>
                        </div>
                    : null
                }
            </div>  
            
            : 
            
            <div className='LoadingPage'>
                <div className='LoadingImage'>
                    <img src={`${BASE_URL}/images/loading.png`}/>
                </div>
            </div>}

            {
                (validService === false || validService === null) && loading == false ? <>
                    <div className='ServiceSelection fade-in-slide-up'>
                        <h1>How can we help you today?</h1>
                        <div className='ServiceSelector'>
                            <button onClick={() => {serviceClickHandler('buy')}}>Buy</button>
                            <button onClick={() => {serviceClickHandler('sell')}}>Sell</button>
                            <button onClick={() => {serviceClickHandler('invest')}}>Invest</button>
                        </div>
                    </div>
                </> : null
            }
        </>
    )
}

export default IngestionPage
