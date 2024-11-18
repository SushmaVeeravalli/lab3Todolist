
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import checkmarkImage from './assets/images/check.png';
import editImage from './assets/images/edit1.png';
import deleteImage from './assets/images/delete1.png';
import uncheckImage from './assets/images/square1.png';
import upadteImage from './assets/images/loop.png';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const deleteAnimation = useRef(new Animated.Value(1)).current; // Animation for task deletion

  // Function to add a new task
  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks([...tasks, newTask]);
      setTask('');
      animateTask(); // Trigger task animation
    }
  };

  // Function to delete a task with animation
  const deleteTask = (taskId) => {
    // Animate the opacity of the task before deletion
    Animated.timing(deleteAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTasks(tasks.filter((item) => item.id !== taskId)); // Remove task after animation completes
      deleteAnimation.setValue(1); // Reset the animation value for future tasks
    });
  };

  // Function to toggle task completion status
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Function to start editing a task
  const startEditing = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setEditingTaskId(taskId);
    setEditingText(task.text);
  };

  // Function to update task text after editing
  const updateTask = () => {
    setTasks(tasks.map(task =>
      task.id === editingTaskId ? { ...task, text: editingText } : task
    ));
    setEditingTaskId(null);
    setEditingText('');
  };

  // Animation for task addition (scaling animation)
  const animation = useRef(new Animated.Value(0)).current;

  const animateTask = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1], // Scale from 1 to 1.1
        }),
      },
    ],
  };

  React.useEffect(() => {
    (async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View style={[styles.taskContainer, animatedStyle, { opacity: deleteAnimation }]}>
            <View style={styles.taskDetails}>
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                  {item.text}
                </Text>

                <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.iconContainer}>
                  <View style={styles.iconWithLabel}>
                    <View style={styles.checkboxContainer}>
                      <Image
                        source={item.completed ? checkmarkImage : uncheckImage}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.checkboxLabel}>{item.completed ? 'Completed' : 'Incomplete'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => startEditing(item.id)} style={styles.iconContainer}>
                <View style={styles.iconWithLabel}>
                  <Image source={editImage} style={styles.actionIcon} />
                  <Text style={styles.iconLabel}>Edit</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconContainer}>
                <View style={styles.iconWithLabel}>
                  <Image source={deleteImage} style={styles.actionIcon} />
                  <Text style={styles.iconLabel}>Delete</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.edit}>
        {editingTaskId && (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editingText}
              onChangeText={setEditingText}
            />
            <TouchableOpacity style={styles.editButton} onPress={updateTask}>
              <Image source={upadteImage} style={styles.actionIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskDetails: {
    flex: 1,
  },
  taskTextContainer: {
    flexDirection: 'row',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  iconContainer: {
    marginLeft: 10,
    alignItems: 'center',
  },
  iconWithLabel: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconLabel: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  edit: {
    marginBottom: 40,
  },
  checkboxContainer: {
    flexDirection: 'row', // Align checkbox and label side by side
    alignItems: 'center', // Vertically center checkbox and label
  },
  checkboxLabel: {
    marginLeft: 5, // Add space between checkbox and label
    fontSize: 12,
    color: '#555',
  },
  editButton: {
    backgroundColor: 'lightgrey',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
});
