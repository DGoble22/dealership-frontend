import React, {useState} from "react";
import "./CarFourm.css";

export default function AddCar({onSuccess}) {
    // Data to be sent to backend
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        trim: "",
        year: "",
        miles: "",
        price: "",
        vin: "",
        status: "Available",
        description: ""
    });

    // Helper function to handle changes in form inputs. It updates the formData state with the new values as the user types or selects options. The function uses the name attribute of the input fields to determine which part of the formData to update.
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData(); // Container for form data and image file to send to backend
        Object.keys(formData).forEach(key => data.append(key, formData[key]));


        try{
            const response = await fetch("http://localhost/dealership-project/backend/api/add_car.php", {
                method: "POST",
                body: data,
            });

            const result = await response.json();
            if (result.status === "success") {
                alert(result.message);
                onSuccess(result.carid); //Closes modal and refreshes the list
            } else {
                alert(result.message);
            }
        } catch (e) {
            console.error("Submission Failed: ", e);
        }
    };

    // Default Year Values
    const years = Array.from({ length: 2026 - 1950 + 1}, (_, i) => 2026 - i);

    return (
        <form className="car-form" onSubmit={handleSubmit}>

            {/* Form Header */ }
            <h2>Vehicle Details</h2>

            {/* Form Grid: Make, Model, Trim, Year, Miles, Price, VIN, Status */ }
            <div className="form-grid">
                <input type="text" name="make" placeholder="Make" onChange={handleChange} required />
                <input type="text" name="model" placeholder="Model" onChange={handleChange} required />
                <input type="text" name="trim" placeholder="Trim" onChange={handleChange} required />
                <select name="year" onChange={handleChange} value={formData.year} required>
                    <option value="">Select Year</option>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <input type="number" name="miles" placeholder="Miles" onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
                <input type="text" name="vin" placeholder="Vin #" onChange={handleChange} required />
                <select name="status" onChange={handleChange}>
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                </select>
            </div>

            {/* Extra Forum Elements: Description, submit */ }
            <textarea name="description" placeholder="Vehicle Details" onChange={handleChange} required />
            <button type="submit" className="submit-btn">Next: Upload Images &rarr;</button>
        </form>
    );
}