import { db, auth } from '../../config/firebaseConfig'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  runTransaction,
} from 'firebase/firestore'

import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import color from '../../constant/color'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemeContext } from '../../context/ThemeContext'

//Temporary userId for testing. This will be removed after login auth is sorted out
//const TEST_USER_ID = 'JT5rpOBgfrYsTm3nhSUUcO84uh93'

//Icons for each habit type
const HABIT_ICONS = {
  health: { icon: 'heart', color: '#FF6B6B', backgroundColor: '#FFEAEA' },
  fitness: { icon: 'dumbbell', color: '#4D96FF', backgroundColor: '#EAF4FF' },
  productivity: {
    icon: 'briefcase',
    color: '#6BCB77',
    backgroundColor: '#EAFBEC',
  },
  mindfulness: { icon: 'brain', color: '#9D65C9', backgroundColor: '#F5EAFF' },
  music: { icon: 'guitar', color: '#FF5A5F', backgroundColor: '#FFEBEC' },
  education: { icon: 'book', color: '#2AB3C0', backgroundColor: '#E6F7F9' },
}

// Days of the week for the weekly calendar
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const AddHabit = ({ navigation }) => {
  const { theme, isDarkMode } = useContext(ThemeContext)
  const [habits, setHabits] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [newHabit, setNewHabit] = useState('')
  const [habitType, setHabitType] = useState('health')
  const [duration, setDuration] = useState('30')
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [selectedDays, setSelectedDays] = useState([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ])
  // As you can see, defaults to all days selected

  // New state variables defined for start and end dates of the habit
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  )
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  // This part gets the current date
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If user is signed in, this will loads their habits
        loadHabits()
      } else {
        // User is signed out, and habits are cleared
        setHabits([])
        Alert.alert(
          'Authentication is Required',
          'Please log in to view your habits'
        )
        navigation.navigate('Login')
      }
    })

    // Clean up the listener when component unmounts
    return () => unsubscribe()
  }, [])

  //This is a function that finds the the current week dates
  const getCurrentWeekDates = () => {
    const today = new Date()

    // Generate array of dates centered around today's date
    const weekDates = []

    // Add 3 days before today
    for (let i = -3; i < 0; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      weekDates.push(date)
    }

    weekDates.push(new Date(today))

    // This will add 3 days after today
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      weekDates.push(date)
    }

    return weekDates
  }

  //This is a function that will toggle daily completions of habit/tasks
  const toggleDayCompletion = async (habitId, dateStr) => {
    try {
      // Find the habit by its id
      const habit = habits.find((h) => h.id === habitId)

      if (!habit) return

      // Create or update completions object
      const completions = habit.completions || {}
      completions[dateStr] = !completions[dateStr] // Toggle completion

      // Update local habit state
      const updatedHabits = habits.map((h) =>
        h.id === habitId ? { ...h, completions } : h
      )
      setHabits(updatedHabits)

      // This will get the authenticated user's id
      const user = auth.currentUser
      if (!user) {
        console.error('No user is signed in')
        return
      }

      const userId = user.uid

      // This will update the habit collection in Firestore
      const habitRef = doc(db, 'users', userId, 'habits', habitId.toString())
      await updateDoc(habitRef, { completions })

      // Updates habitProgress collection
      await updateHabitProgress(habit, userId, dateStr, completions[dateStr])

      // Check if today's habit is completed and update the main
      const today = new Date().toISOString().split('T')[0]
      if (dateStr === today) {
        await updateDoc(habitRef, { completed: completions[dateStr] })
      }
    } catch (error) {
      console.error('Error toggling day completion:', error)
      Alert.alert(
        'Error',
        'Failed to update habit completion. Please try again.'
      )
    }
  }

  const updateHabitProgress = async (habit, userId, dateStr, isCompleted) => {
    try {
      const progressRef = doc(
        db,
        'users',
        userId,
        'habitProgress',
        habit.id.toString()
      )

      // Uses transaction to safely update progress information
      await runTransaction(db, async (transaction) => {
        const progressDoc = await transaction.get(progressRef)

        if (!progressDoc.exists()) {
          // Calculations for a new progress
          const possibleDates = getAllPossibleDates(habit)
          const completions = habit.completions || {}

          // Initialize the progress object
          const progressData = {
            habitId: habit.id,
            habitName: habit.name,
            completions: { [dateStr]: isCompleted },
            streaks: { currentStreak: 0, longestStreak: 0 },
            metrics: {
              totalDays: possibleDates.length,
              completedDays: 0,
              completionRate: 0,
            },
            lastUpdated: Timestamp.now(),
          }

          // Calculates completions
          let completedCount = 0
          possibleDates.forEach((date) => {
            // This will include the toggled date into the count
            if (date === dateStr) {
              if (isCompleted) completedCount++
            }
            // This will include previous completions
            else if (completions[date]) {
              progressData.completions[date] = true
              completedCount++
            }
          })

          // Updates count
          progressData.metrics.completedDays = completedCount
          progressData.metrics.completionRate =
            possibleDates.length > 0 ? completedCount / possibleDates.length : 0

          // Calculates streak
          const sortedDates = Object.keys(progressData.completions).sort()
          calculateStreaks(
            sortedDates,
            progressData.completions,
            progressData.streaks
          )

          transaction.set(progressRef, progressData)
        } else {
          // This will update existing progress
          const progressData = progressDoc.data()
          const progressCompletions = progressData.completions || {}
          progressCompletions[dateStr] = isCompleted
          const possibleDates = getAllPossibleDates(habit)
          let completedCount = 0

          possibleDates.forEach((date) => {
            if (progressCompletions[date]) {
              completedCount++
            }
          })

          // Update the metrics
          const metrics = {
            totalDays: possibleDates.length,
            completedDays: completedCount,
            completionRate:
              possibleDates.length > 0
                ? completedCount / possibleDates.length
                : 0,
          }

          // This serves to calculate streaks
          const sortedDates = Object.keys(progressCompletions).sort()
          const streaks = {
            currentStreak: 0,
            longestStreak: progressData.streaks?.longestStreak || 0,
          }
          calculateStreaks(sortedDates, progressCompletions, streaks)

          transaction.update(progressRef, {
            completions: progressCompletions,
            streaks,
            metrics,
            lastUpdated: Timestamp.now(),
          })
        }
      })
    } catch (error) {
      console.error('Error updating habit progress:', error)
      throw error
    }
  }

  const calculateStreaks = (sortedDates, completions, streaks) => {
    // Calculate current streak
    let currentStreak = 0

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Find index of today or the latest date before today
    let latestIdx = sortedDates.length - 1
    while (latestIdx >= 0 && sortedDates[latestIdx] > today) {
      latestIdx--
    }

    // Count backward from today/latest date to find current streak
    for (let i = latestIdx; i >= 0; i--) {
      if (completions[sortedDates[i]]) {
        currentStreak++
      } else {
        break
      }
    }

    streaks.currentStreak = currentStreak
    streaks.longestStreak = Math.max(streaks.longestStreak, currentStreak)
  }

  //This is a function that will calculate the habit's progress for the progress bar
  const calculateHabitProgress = (habit) => {
    // Get the 7-day centered week
    const weekDates = getCurrentWeekDates()

    // Get current date for comparison
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const possibleDates = weekDates.filter((date) => {
      return date <= today && habit.selectedDays[date.getDay()]
    })

    // Get completed dates
    const completions = habit.completions || {}

    // Count completed dates
    let completedCount = 0
    possibleDates.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0]
      if (completions[dateStr]) {
        completedCount++
      }
    })

    // Calculate percentage
    const total = possibleDates.length
    if (total === 0) return 0 // Avoid division by zero

    return Math.round((completedCount / total) * 100)
  }

  const getAllPossibleDates = (habit) => {
    const possibleDates = []
    const startDate = new Date(habit.startDate)
    const endDate = new Date(habit.endDate)

    // Limit end date to today (can't complete future dates)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    const effectiveEndDate = endDate > today ? today : endDate

    // Iterate through each day from start to end
    for (
      let date = new Date(startDate);
      date <= effectiveEndDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

      // Check if this day is selected for the habit
      if (habit.selectedDays[dayOfWeek]) {
        possibleDates.push(date.toISOString().split('T')[0])
      }
    }

    return possibleDates
  }

  const saveHabits = async (updatedHabits) => {
    try {
      // This will update the local state
      setHabits(updatedHabits)

      // Gets the current user ID to ensure a user is signed in
      const user = auth.currentUser
      if (!user) {
        console.error('No user is signed in')
        Alert.alert('Error', 'You need to be logged in to save habits.')
        return
      }

      const userId = user.uid

      // Reference to the user's habits collection
      const userHabitsRef = collection(db, 'users', userId, 'habits')

      // For each habit in the updated list this will be saved to Firestore
      const savePromises = updatedHabits.map(async (habit) => {
        const habitDocRef = doc(userHabitsRef, habit.id.toString())

        // This part will convert dates to Firestore Timestamp
        const firestoreHabit = {
          ...habit,
          startDate: habit.startDate
            ? Timestamp.fromDate(new Date(habit.startDate))
            : null,
          endDate: habit.endDate
            ? Timestamp.fromDate(new Date(habit.endDate))
            : null,
          createdAt: habit.createdAt
            ? Timestamp.fromDate(new Date(habit.createdAt))
            : Timestamp.now(),
        }

        return setDoc(habitDocRef, firestoreHabit, { merge: true })
      })

      await Promise.all(savePromises)
    } catch (error) {
      console.error('Error saving habits to Firestore:', error)
      Alert.alert(
        'Error',
        'Failed to save habits to firebase. Please try again.'
      )
    }
  }

  const loadHabits = async () => {
    try {
      // Step to get the user ID
      const user = auth.currentUser
      if (!user) {
        console.error('No user is signed in')
        return
      }

      const userId = user.uid

      // References user's habits collection
      const userHabitsRef = collection(db, 'users', userId, 'habits')

      // Get all habits under this specific user
      const querySnapshot = await getDocs(userHabitsRef)

      // Converts Firestore documents to habit objects
      const habitsData = querySnapshot.docs.map((doc) => {
        const data = doc.data()

        // This step now converts Firestore timestamps back to ISO strings
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate
            ? data.startDate.toDate().toISOString()
            : null,
          endDate: data.endDate ? data.endDate.toDate().toISOString() : null,
          createdAt: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : null,
          completions: data.completions || {},
        }
      })
      setHabits(habitsData)
    } catch (error) {
      console.error(
        'Error occurred while loading habits from Firestore:',
        error
      )
    }
  }

  const resetForm = () => {
    setNewHabit('')
    setHabitType('health')
    setDuration('30')
    setSelectedTime(new Date())
    setSelectedDays([true, true, true, true, true, true, true])
    setEditingHabit(null)

    // Reset date values
    setStartDate(new Date())
    setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1)))
  }

  const openAddModal = () => {
    resetForm()
    setModalVisible(true)
  }

  const openEditModal = (habit) => {
    setEditingHabit(habit.id)
    setNewHabit(habit.name)
    setHabitType(habit.type)
    setDuration(habit.duration.toString())

    // Parse time from HH:MM format
    const [hours, minutes] = habit.time.split(':').map(Number)
    const timeDate = new Date()
    timeDate.setHours(hours, minutes, 0)
    setSelectedTime(timeDate)

    // Handle selected days in boolean array format
    if (habit.selectedDays) {
      // If the data comes from old format (array of indices)
      if (
        Array.isArray(habit.selectedDays) &&
        typeof habit.selectedDays[0] === 'number'
      ) {
        const booleanArray = [false, false, false, false, false, false, false]
        habit.selectedDays.forEach((dayIndex) => {
          booleanArray[dayIndex] = true
        })
        setSelectedDays(booleanArray)
      } else {
        setSelectedDays(habit.selectedDays)
      }
    } else {
      setSelectedDays([true, true, true, true, true, true, true])
    }

    // Set start and end dates if they exist, otherwise use defaults
    if (habit.startDate) {
      setStartDate(new Date(habit.startDate))
    }
    if (habit.endDate) {
      setEndDate(new Date(habit.endDate))
    }

    setModalVisible(true)
  }

  //Function that handles the saving of habits
  const handleSaveHabit = () => {
    if (newHabit.trim() === '') {
      Alert.alert('Error', 'Please fill out the Habit name!')
      return
    }

    // Validate dates
    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after the start date!')
      return
    }

    // Format time as HH:MM
    const hours = selectedTime.getHours().toString().padStart(2, '0')
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0')
    const formattedTime = `${hours}:${minutes}`

    // Get icon for the habit type
    const iconInfo = HABIT_ICONS[habitType] || HABIT_ICONS.health

    const habitData = {
      id: editingHabit || Date.now(),
      name: newHabit,
      type: habitType,
      icon: iconInfo.icon,
      iconColor: iconInfo.color,
      iconBgColor: iconInfo.backgroundColor,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: parseInt(duration, 10),
      time: formattedTime,
      completed: false,
      selectedDays: selectedDays,
      completions: {},
      createdAt: new Date().toISOString(),
    }

    let updatedHabits
    if (editingHabit) {
      const existingHabit = habits.find((h) => h.id === editingHabit)
      if (existingHabit) {
        habitData.completed = existingHabit.completed
      }

      updatedHabits = habits.map((habit) =>
        habit.id === editingHabit ? habitData : habit
      )
    } else {
      updatedHabits = [...habits, habitData]
    }

    saveHabits(updatedHabits)
    resetForm()
    setModalVisible(false)
  }

  const toggleCompleteHabit = (id) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    )
    saveHabits(updatedHabits)
  }

  const deleteHabit = (id) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Update local state
            const updatedHabits = habits.filter((habit) => habit.id !== id)
            setHabits(updatedHabits)

            // Delete from Firestore
            const user = auth.currentUser

            if (user) {
              const userId = user.uid
              const habitDocRef = doc(
                db,
                'users',
                userId,
                'habits',
                id.toString()
              )
              await deleteDoc(habitDocRef)
            } else {
              console.error('Failed to delete: No user is signed in')
              Alert.alert('Error', 'You must be logged in to delete habits.')
            }
          } catch (error) {
            console.error('Error deleting habit:', error)
            Alert.alert(
              'Error',
              'Failed to delete this habit. Please try again.'
            )
          }
        },
      },
    ])
  }

  const toggleDaySelection = (dayIndex) => {
    const newSelectedDays = [...selectedDays]

    // Check if we'd be turning off the last day
    const wouldLeaveNoDays =
      selectedDays.filter((day) => day).length === 1 && selectedDays[dayIndex]

    // Toggle the selected day
    if (!wouldLeaveNoDays) {
      newSelectedDays[dayIndex] = !newSelectedDays[dayIndex]
      setSelectedDays(newSelectedDays)
    }
  }

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Function to format the schedule display for the habit card
  const formatSchedule = (days) => {
    if (!days) return 'Every day'

    // This serves to check if all days are selected
    if (days.every((day) => day)) return 'Every day'

    // Checks if no days are selected (shouldn't happen with your validation)
    if (days.every((day) => !day)) return 'No days selected'

    // This will check for weekdays
    const isWeekdays =
      days[1] &&
      days[2] &&
      days[3] &&
      days[4] &&
      days[5] &&
      !days[0] &&
      !days[6]
    if (isWeekdays) return 'Weekdays'

    // This part checks for weekends
    const isWeekends =
      days[0] &&
      days[6] &&
      !days[1] &&
      !days[2] &&
      !days[3] &&
      !days[4] &&
      !days[5]
    if (isWeekends) return 'Weekends'

    return DAYS_OF_WEEK.filter((_, index) => days[index]).join(', ')
  }

  // Format date range for display in habit card
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return ''

    const start = new Date(startDate)
    const end = new Date(endDate)

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  // Sort habits: completed at the bottom
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1
    return 0
  })

  // Check if a habit should be shown today based on date range and day selection
  const isTodayHabit = (habit) => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    // Check if today is in the date range
    const startDate = habit.startDate ? new Date(habit.startDate) : null
    const endDate = habit.endDate ? new Date(habit.endDate) : null

    // Check if today is within date range
    const isInDateRange =
      (!startDate || today >= startDate) && (!endDate || today <= endDate)

    // Check if today is a selected day of week
    const isSelectedDay = !habit.selectedDays || habit.selectedDays[dayOfWeek]

    return isInDateRange && isSelectedDay
  }

  // Filter habits for today
  const todayHabits = sortedHabits.filter(isTodayHabit)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[color.secondaryColor, '#7B68EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientCard}
        >
          <Text style={styles.quoteText}>
            Everyday is a new beginning to pursue something exceptional.
          </Text>
        </LinearGradient>

        {/* Today's Goals Section */}
        <View style={styles.goalsHeader}>
          <Text style={[styles.goalsTitle, { color: theme.textColor }]}>Today's Habits</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Habits List */}
        <View style={styles.habitsList}>
          {todayHabits.length > 0 ? (
            todayHabits.map((habit) => (
              <View key={habit.id} style={[styles.habitCard, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.habitCardContent}>
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${calculateHabitProgress(habit)}%`,
                            backgroundColor: '#4DA9FF',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textColor }]}>
                      {calculateHabitProgress(habit)}% Weekly Completion
                    </Text>
                  </View>

                  {/* Habit Info Row */}
                  <View style={styles.habitInfoRow}>
                    <TouchableOpacity
                      style={styles.habitLeft}
                      onPress={() => openEditModal(habit)}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: habit.iconBgColor },
                        ]}
                      >
                        <FontAwesome5
                          name={habit.icon}
                          size={18}
                          color={habit.iconColor}
                          solid
                        />
                      </View>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitName, { color: theme.textColor }]}>{habit.name}</Text>
                        <Text style={[styles.habitTime, { color: theme.secondaryTextColor }]}>
                          {habit.duration} mins at {habit.time}
                        </Text>
                        {/* <Text style={[styles.habitSchedule, { color: theme.secondaryTextColor }]}>
                          {formatSchedule(habit.selectedDays)}
                        </Text> */}
                      </View>
                    </TouchableOpacity>

                    {/* Action Buttons */}
                    <View style={styles.habitActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal(habit)}
                      >
                        <Feather name='edit-2' size={16} color={theme.secondaryTextColor} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteHabit(habit.id)}
                      >
                        <Feather name='trash-2' size={16} color='#FF6B6B' />
                      </TouchableOpacity>
                      {/* <TouchableOpacity
                        style={[
                          styles.startButton,
                          habit.completed && styles.completedButton,
                        ]}
                        onPress={() => toggleCompleteHabit(habit.id)}
                      >
                        {habit.completed ? (
                          <Feather name='check' size={20} color='#fff' />
                        ) : (
                          <Text style={styles.startButtonText}>Start</Text>
                        )}
                      </TouchableOpacity> */}
                    </View>
                  </View>

                  {/* Weekly Calendar */}
                  <View style={styles.weeklyCalendar}>
                    {getCurrentWeekDates().map((date, index) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const isToday =
                        new Date().toISOString().split('T')[0] === dateStr
                      const isSelected = habit.selectedDays[date.getDay()]
                      const isCompleted =
                        habit.completions && habit.completions[dateStr]

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.calendarDay,
                            isSelected && styles.calendarDaySelected,
                            isToday && styles.calendarDayToday,
                            isCompleted && styles.calendarDayCompleted,
                            (!isSelected || date > new Date()) &&
                              styles.calendarDayDisabled,
                          ]}
                          onPress={() => {
                            if (isSelected && date <= new Date()) {
                              toggleDayCompletion(habit.id, dateStr)
                            }
                          }}
                          disabled={!isSelected || date > new Date()}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              isToday && styles.calendarDayTextToday,
                              isCompleted && styles.calendarDayTextCompleted,
                            ]}
                          >
                            {DAYS_OF_WEEK[date.getDay()]}
                          </Text>
                          <Text
                            style={[
                              styles.calendarDateText,
                              isToday && styles.calendarDateTextToday,
                              isCompleted && styles.calendarDateTextCompleted,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                          {isCompleted && (
                            <View
                              style={[
                                styles.completionIndicator,
                                { backgroundColor: '#4DA9FF' },
                              ]}
                            >
                              <Feather name='check' size={12} color='#fff' />
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textColor }]}>No habits for today</Text>
              <Text style={[styles.emptySubText, { color: theme.secondaryTextColor }]}>
                Tap the + button to add a new habit
              </Text>
            </View>
          )}
        </View>

        {/* All Habits Section */}
        {habits.length > 0 && todayHabits.length < habits.length && (
          <>
            <View style={styles.goalsHeader}>
              <Text style={[styles.goalsTitle, { color: theme.textColor }]}>All Habits</Text>
            </View>
            <View style={styles.habitsList}>
              {sortedHabits
                .filter((habit) => !isTodayHabit(habit))
                .map((habit) => (
                  <View
                    key={habit.id}
                    style={[styles.habitCard, styles.inactiveHabitCard, { backgroundColor: theme.cardBackground }]}
                  >
                    <TouchableOpacity
                      style={styles.habitLeft}
                      onPress={() => openEditModal(habit)}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: habit.iconBgColor },
                        ]}
                      >
                        <FontAwesome5
                          name={habit.icon}
                          size={18}
                          color={habit.iconColor}
                          solid
                        />
                      </View>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitName, { color: theme.textColor }]}>{habit.name}</Text>
                        <Text style={[styles.habitTime, { color: theme.secondaryTextColor }]}>
                          {habit.duration} mins at {habit.time}
                        </Text>
                        <Text style={[styles.habitSchedule, { color: theme.secondaryTextColor }]}>
                          {formatSchedule(habit.selectedDays)}
                        </Text>
                        {habit.startDate && habit.endDate && (
                          <Text style={styles.habitDates}>
                            {formatDateRange(habit.startDate, habit.endDate)}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <View style={styles.habitActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal(habit)}
                      >
                        <Feather name='edit-2' size={16} color={theme.secondaryTextColor} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteHabit(habit.id)}
                      >
                        <Feather name='trash-2' size={16} color='#FF6B6B' />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal for Adding/Editing Habit */}
      <Modal visible={modalVisible} transparent animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                {editingHabit ? 'Edit Habit' : 'New Habit'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  resetForm()
                  setModalVisible(false)
                }}
              >
                <Feather name='x' size={24} color={theme.secondaryTextColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.inputLabel, { color: theme.textColor }]}>
                What habit would you like to build?
              </Text>
              <TextInput
                placeholder='e.g., Play an instrument'
                placeholderTextColor={theme.secondaryTextColor}
                value={newHabit}
                onChangeText={setNewHabit}
                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor, backgroundColor: isDarkMode ? theme.backgroundColor : '#fff' }]}
              />

              <Text style={[styles.inputLabel, { color: theme.textColor }]}>Category</Text>
              <View style={styles.typeContainer}>
                {Object.entries(HABIT_ICONS).map(([type, data]) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      habitType === type && styles.typeButtonSelected,
                      habitType === type && { borderColor: data.color },
                    ]}
                    onPress={() => setHabitType(type)}
                  >
                    <View
                      style={[
                        styles.typeIconContainer,
                        { backgroundColor: data.backgroundColor },
                      ]}
                    >
                      <FontAwesome5
                        name={data.icon}
                        size={16}
                        color={data.color}
                        solid
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeText,
                        habitType === type && {
                          color: color.primaryColor,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Days of Week Selection */}
              <Text style={[styles.inputLabel, { color: theme.textColor }]}>Days of Week</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDays[index] && styles.dayButtonSelected,
                      { borderColor: theme.borderColor }
                    ]}
                    onPress={() => toggleDaySelection(index)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: theme.textColor },
                        selectedDays[index] && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Start Date Picker */}
              <Text style={[styles.inputLabel, { color: theme.textColor }]}>Start Date</Text>
              <TouchableOpacity
                style={[styles.dateTimeButton, { borderColor: theme.borderColor, backgroundColor: isDarkMode ? theme.backgroundColor : '#fff' }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Feather
                  name='calendar'
                  size={16}
                  color={theme.secondaryTextColor}
                  style={styles.dateTimeIcon}
                />
                <Text style={[styles.dateTimeText, { color: theme.textColor }]}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode='date'
                  display='default'
                  onChange={(event, date) => {
                    setShowStartDatePicker(false)
                    if (date) setStartDate(date)
                  }}
                  minimumDate={new Date()}
                />
              )}

              {/* End Date Picker */}
              <Text style={[styles.inputLabel, { color: theme.textColor }]}>End Date</Text>
              <TouchableOpacity
                style={[styles.dateTimeButton, { borderColor: theme.borderColor, backgroundColor: isDarkMode ? theme.backgroundColor : '#fff' }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Feather
                  name='calendar'
                  size={16}
                  color={theme.secondaryTextColor}
                  style={styles.dateTimeIcon}
                />
                <Text style={[styles.dateTimeText, { color: theme.textColor }]}>
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode='date'
                  display='default'
                  onChange={(event, date) => {
                    setShowEndDatePicker(false)
                    if (date) setEndDate(date)
                  }}
                  minimumDate={startDate}
                />
              )}

              {/* Time Picker */}
              <Text style={[styles.inputLabel, { color: theme.textColor }]}>Time of Day</Text>
              <TouchableOpacity
                style={[styles.dateTimeButton, { borderColor: theme.borderColor, backgroundColor: isDarkMode ? theme.backgroundColor : '#fff' }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Feather
                  name='clock'
                  size={16}
                  color={theme.secondaryTextColor}
                  style={styles.dateTimeIcon}
                />
                <Text style={[styles.dateTimeText, { color: theme.textColor }]}>
                  {selectedTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode='time'
                  display='default'
                  onChange={(event, time) => {
                    setShowTimePicker(false)
                    if (time) setSelectedTime(time)
                  }}
                />
              )}

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={[styles.inputLabel, { color: theme.textColor }]}>Duration (min)</Text>
                  <TextInput
                    placeholder='30'
                    placeholderTextColor={theme.secondaryTextColor}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType='numeric'
                    style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor, backgroundColor: isDarkMode ? theme.backgroundColor : '#fff' }]}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primaryColor }]}
                onPress={handleSaveHabit}
              >
                <Text style={styles.saveButtonText}>
                  {editingHabit ? 'Update Habit' : 'Create Habit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  gradientCard: {
    margin: 8,
    marginBottom: 35,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  goalsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.primaryColor,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: color.primaryColor,
    fontWeight: '500',
    marginTop: -2,
  },
  habitsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  habitCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitCardContent: {
    width: '100%',
  },
  habitInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inactiveHabitCard: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: color.primaryColor,
    marginBottom: 4,
  },
  habitTime: {
    fontSize: 14,
    color: '#64748B',
  },
  habitSchedule: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  habitDates: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#5E72E4',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: color.primaryColor,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 16,
  },
  modalContent: {
    borderRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.primaryColor,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
    color: color.primaryColor,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeButtonSelected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  typeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeText: { fontSize: 14, color: '#64748B', flex: 1 },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayButtonSelected: {
    backgroundColor: color.primaryLighter,
    borderColor: color.primaryColor,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  dayTextSelected: {
    color: color.primaryColor,
    fontWeight: 'bold',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfInput: {
    width: '48%',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: color.primaryColor,
  },
  saveButton: {
    backgroundColor: color.primaryColor,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  weeklyCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  calendarDay: {
    width: 36,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  calendarDaySelected: {
    backgroundColor: '#F0F4FF',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: color.primaryColor,
  },
  calendarDayCompleted: {
    backgroundColor: '#E6F3FF',
  },
  calendarDayDisabled: {
    opacity: 0.4,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  calendarDateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  calendarDayTextToday: {
    color: color.primaryColor,
  },
  calendarDateTextToday: {
    color: color.primaryColor,
  },
  calendarDayTextCompleted: {
    color: '#4DA9FF',
  },
  calendarDateTextCompleted: {
    color: '#4DA9FF',
  },
  completionIndicator: {
    position: 'absolute',
    bottom: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4DA9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.primaryColor,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
})

export default AddHabit
