import React, { useState} from "react";
import "./CarFourm.css";

export default function UpdateCar({car, onSuccess}) {
    const [formData, setFormData] = useState({
        carid: car.carid,
        make: "",
        model: "",
        trim: "",
        year: "",
        miles: "",
        price: "",
        vin: "",
        status: "",
        description: ""
    });

    // Helper function to handle changes in form inputs. It updates the formData state with the new values as the user types or selects options. The function uses the name attribute of the input fields to determine which part of the formData to update.
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter out unused fields and keep carid
        const filteredData = Object.fromEntries(
            Object.entries(formData).filter(([key, value]) => {
                    if (key === "carid") return true;
                    return value !== "" && value !== null && value !== undefined;
                })
         );

        // Check to see if there are values to update
        if(Object.keys(filteredData).length <= 1){
            alert("Please fill out at least one field to update.");
            return;
        }

        try{
            const responce = await fetch("http://localhost/dealership-project/backend/api/update_car.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(filteredData),
            });

            const result = await responce.json();
            if (result.status === "success") {
                alert(result.message);
                onSuccess(); //Closes modal and refreshes the list
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
            <h2>Update Vehicle Details</h2>

            {/* Form Grid: Make, Model, Trim, Year, Miles, Price, VIN, Status */ }
            <div className="form-grid">
                <input type="text" name="make" placeholder={car.make} onChange={handleChange} />
                <input type="text" name="model" placeholder={car.model} onChange={handleChange} />
                <input type="text" name="trim" placeholder={car.trim} onChange={handleChange} />
                <select name="year" onChange={handleChange} value={formData.year} >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <input type="number" name="miles" placeholder={car.miles} onChange={handleChange} />
                <input type="number" name="price" placeholder={car.price} onChange={handleChange} />
                <input type="text" name="vin" placeholder={car.vin} onChange={handleChange} />
                <select name="status" onChange={handleChange}>
                    <option value=""></option>
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
                </select>
            </div>

            {/* Extra Forum Elements: Description, submit */ }
            <textarea name="description" placeholder={car.description} onChange={handleChange} />
            <button type="submit" className="submit-btn">Update</button>
        </form>
    );
}