import { createContext, useContext, useState, useEffect } from "react"
import { message } from "antd"
import { AuthContext } from "./AuthContext"

const API_BASE_URL = 'http://localhost:5000/api';

const DataContext = createContext()

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const DataProvider = ({ children }) => {
  const [trainees, setTrainees] = useState([])
  const [rooms, setRooms] = useState({ A: [], B: [], C: [] })
  const [amenitiesInventory, setAmenitiesInventory] = useState({})
  const [loading, setLoading] = useState(false)

  // Fetch data from API
  const fetchTrainees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trainees`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setTrainees(data.data.trainees);
      }
    } catch (error) {
      console.error('Error fetching trainees:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const roomsByBlock = { A: [], B: [], C: [] };
      
      for (const block of ['A', 'B', 'C']) {
        const response = await fetch(`${API_BASE_URL}/rooms/block/${block}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          roomsByBlock[block] = data.data.rooms;
        }
      }
      
      setRooms(roomsByBlock);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/amenities`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const amenitiesMap = {};
        data.data.items.forEach(item => {
          amenitiesMap[item.name] = {
            total: item.totalQuantity,
            available: item.availableQuantity,
            inUse: item.inUseQuantity,
            used: item.usedQuantity,
            damaged: item.damagedQuantity || 0
          };
        });
        setAmenitiesInventory(amenitiesMap);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchTrainees();
      fetchRooms();
      fetchAmenities();
    }
  }, []);

  // Get all trainees from current state (not static data)
  const getAllTrainees = () => {
    return trainees || []
  }

  // Calculate occupancy statistics
  const getOccupancyStats = () => {
    const allRooms = [...rooms.A, ...rooms.B, ...rooms.C]
    // Only count rooms that can be occupied (exclude blocked, store, etc.)
    const occupiableRooms = allRooms.filter(room => 
      !['blocked', 'store', 'maintenance'].includes(room.status)
    )
    const totalRooms = occupiableRooms.length
    const occupiedRooms = occupiableRooms.filter((room) => room.status === "occupied").length
    const vacantRooms = occupiableRooms.filter((room) => room.status === "vacant").length

    return {
      total: totalRooms,
      occupied: occupiedRooms,
      vacant: vacantRooms,
      occupancyPercentage: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      vacancyPercentage: totalRooms > 0 ? Math.round((vacantRooms / totalRooms) * 100) : 0,
    }
  }

  // Find which block a room belongs to based on room number
  const findRoomBlock = (roomNumber) => {
    const num = Number.parseInt(roomNumber)
    if (num >= 1 && num <= 43) return "A"
    if (num >= 44 && num <= 86) return "B"
    if (num >= 87 && num <= 114) return "C"
    return "A" // default
  }

  // Allocate room to trainee
  const allocateRoom = async (traineeData, roomNumber, block) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/allotments/allocate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          traineeData,
          roomNumber: parseInt(roomNumber),
          block,
          bedNumber: 1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await fetchTrainees();
        await fetchRooms();
        await fetchAmenities();
        message.success('Room allocated successfully');
        return data.data.trainee;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      message.error(error.message || 'Failed to allocate room');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Checkout trainee
  const checkoutTrainee = async (traineeId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/trainees/${traineeId}/checkout`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await fetchTrainees();
        await fetchRooms();
        await fetchAmenities();
        message.success('Trainee checked out successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error checking out trainee:', error);
      message.error(error.message || 'Failed to checkout trainee');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Update trainee
  const updateTrainee = async (traineeId, updatedData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/trainees/${traineeId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await fetchTrainees();
        await fetchRooms();
        message.success('Trainee updated successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating trainee:', error);
      message.error(error.message || 'Failed to update trainee');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Return amenities from trainee
  const returnAmenities = async (traineeId, amenityName, quantity) => {
    try {
      setLoading(true);
      
      // Find the inventory item
      const response = await fetch(`${API_BASE_URL}/amenities`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        const item = data.data.items.find(item => item.name === amenityName);
        if (!item) {
          throw new Error('Amenity not found');
        }
        
        const returnResponse = await fetch(`${API_BASE_URL}/amenities/return`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            itemId: item._id,
            traineeId,
            quantity,
            condition: 'used'
          })
        });
        
        const returnData = await returnResponse.json();
        
        if (returnData.success) {
          // Refresh data
          await fetchTrainees();
          await fetchAmenities();
          return true;
        } else {
          throw new Error(returnData.message);
        }
      }
    } catch (error) {
      console.error('Error returning amenities:', error);
      message.error(error.message || 'Failed to return amenities');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Allocate new amenities to trainee
  const allocateAmenities = async (traineeId, amenityName, quantity) => {
    try {
      setLoading(true);
      
      // Find the inventory item
      const response = await fetch(`${API_BASE_URL}/amenities`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        const item = data.data.items.find(item => item.name === amenityName);
        if (!item) {
          throw new Error('Amenity not found');
        }
        
        const allocateResponse = await fetch(`${API_BASE_URL}/amenities/allocate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            itemId: item._id,
            traineeId,
            quantity
          })
        });
        
        const allocateData = await allocateResponse.json();
        
        if (allocateData.success) {
          // Refresh data
          await fetchTrainees();
          await fetchAmenities();
          return true;
        } else {
          throw new Error(allocateData.message);
        }
      }
    } catch (error) {
      console.error('Error allocating amenities:', error);
      message.error(error.message || 'Failed to allocate amenities');
      return false;
    } finally {
      setLoading(false);
    }
  // Add room function
  const addRoom = async (roomData, block) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...roomData,
          block
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRooms();
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      message.error(error.message || 'Failed to add room');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Update room function
  const updateRoom = async (roomNumber, block, updateData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/rooms/${block}/${roomNumber}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRooms();
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      message.error(error.message || 'Failed to update room');
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Delete room function
  const deleteRoom = async (roomNumber, block) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/rooms/${block}/${roomNumber}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
  }
      const data = await response.json();
      
      if (data.success) {
        await fetchRooms();
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error(error.message || 'Failed to delete room');
      return false;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    trainees,
    rooms,
    amenitiesInventory,
    loading,
    getAllTrainees,
    getOccupancyStats,
    allocateRoom,
    checkoutTrainee,
    updateTrainee,
    returnAmenities,
    allocateAmenities,
    fetchTrainees,
    fetchRooms,
    fetchAmenities,
    addRoom,
    updateRoom,
    deleteRoom,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
