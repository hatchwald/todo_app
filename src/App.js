import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	Card,
	ActionIcon,
	Code,
} from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { Check, MoonStars, Pencil, Sun, Trash } from 'tabler-icons-react';

import {
	MantineProvider,
	ColorSchemeProvider,
	ColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function App() {
	const [tasks, setTasks] = useState([]);
	const [opened, setOpened] = useState(false);
	const [updated, setUpdate] = useState(false);
	const [tmpdata, setData] = useState([]);
	const [errorMsg, setError] = useState([])
	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	const taskTitle = useRef('');
	const taskSummary = useRef('');

	const form = useForm({
		initialValues: { title: '', summary: '' },
		validate: {
			title: (value) => (value.length < 1 ? 'Title is required' : null),
			summary: (value) => (value.length < 1 ? 'Summary is required' : null)
		},
	});

	function createTask() {

		let ids = 1
		if (tasks.length == 0) {
			ids = 1
		} else {
			console.log("length", tasks.length)
			console.log("data", tasks);
			const current_num = tasks[tasks.length - 1].id
			ids = current_num + 1
		}
		setTasks([
			...tasks,
			{
				id: `id-${ids}`,
				title: taskTitle.current.value,
				summary: taskSummary.current.value,
				done: false
			},
		]);

		saveTasks([
			...tasks,
			{
				id: `id-${ids}`,
				title: taskTitle.current.value,
				summary: taskSummary.current.value,
				done: false
			},
		]);
	}

	function deleteTask(index) {
		var clonedTasks = [...tasks];

		clonedTasks.splice(index, 1);

		setTasks(clonedTasks);

		saveTasks([...clonedTasks]);
	}

	function loadTasks() {
		let loadedTasks = localStorage.getItem('tasks');

		let tasks = JSON.parse(loadedTasks);

		if (tasks) {
			setTasks(tasks);
		}
	}

	function saveTasks(tasks) {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	function updateTask(index) {
		const current_data = tasks[index]
		setData(
			{
				title: current_data.title,
				summary: current_data.summary,
				index: index
			})
		setUpdate(true)
		setOpened(true)
	}
	function doUpdate() {
		tasks[tmpdata.index].summary = taskSummary.current.value
		tasks[tmpdata.index].title = taskTitle.current.value
		setTasks(tasks)
		saveTasks([...tasks])
	}

	function checkTask(index) {
		const clonedTasks = [...tasks]
		clonedTasks[index].done = true
		setTasks(clonedTasks)
		saveTasks([...clonedTasks])
	}
	function handleOnDragEnd(params) {
		if (!params.destination) return
		const items = Array.from(tasks);
		const [reorderedItem] = items.splice(params.source.index, 1);
		items.splice(params.destination.index, 0, reorderedItem);

		setTasks(items);
	}

	useEffect(() => {
		loadTasks();
	}, []);

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}>
			<MantineProvider
				theme={{ colorScheme, defaultRadius: 'md' }}
				withGlobalStyles
				withNormalizeCSS>
				<div className='App'>
					<Modal
						opened={opened}
						size={'md'}
						title={updated ? 'Update Task' : 'New Task'}
						withCloseButton={false}
						onClose={() => {
							setOpened(false);
						}}
						centered>
						<form>

							<TextInput
								mt={'md'}
								ref={taskTitle}
								placeholder={'Task Title'}
								label={'Title'}
								defaultValue={tmpdata.title ?? ''}
								required
							/>
							<TextInput
								ref={taskSummary}
								mt={'md'}
								placeholder={'Task Summary'}
								label={'Summary'}
								defaultValue={tmpdata.summary ?? ''}
								required
							/>
							<Group mt={'md'} position={'apart'}>
								<Button
									onClick={() => {
										setOpened(false);
									}}
									variant={'subtle'}>
									Cancel
								</Button>
								<Button
									onClick={() => {
										if (updated) {
											doUpdate()
										} else {
											createTask();
										}
										setOpened(false);
									}}>
									{updated ? 'Update Task' : 'Create Task'}

								</Button>
							</Group>
						</form>
					</Modal>
					<Container size={550} my={40}>
						<Group position={'apart'}>
							<Title
								sx={theme => ({
									fontFamily: `Greycliff CF, ${theme.fontFamily}`,
									fontWeight: 900,
								})}>
								My Tasks
							</Title>
							<ActionIcon
								color={'blue'}
								onClick={() => toggleColorScheme()}
								size='lg'>
								{colorScheme === 'dark' ? (
									<Sun size={16} />
								) : (
									<MoonStars size={16} />
								)}
							</ActionIcon>
						</Group>
						<Button
							onClick={() => {
								setOpened(true);
								setUpdate(false);
								setData({})
								setError()
								console.log(tasks)
							}}
							fullWidth
							mt={'md'}>
							New Task
						</Button>
						<Card withBorder={1} mt={5}>
							<DragDropContext onDragEnd={handleOnDragEnd}>
								<Droppable droppableId='tasks'>
									{(provided) => (
										<div {...provided.droppableProps} ref={provided.innerRef}>

											{tasks.length > 0 ? (
												tasks.map((task, index) => {
													if (task.title) {
														return (
															<Draggable key={task.id} draggableId={task.id} index={index}>
																{(provided) => (

																	<Card withBorder key={index} mt={'sm'} ref={provided.innerRef} {...provided.draggableProps}{...provided.dragHandleProps}>
																		<Group position={'apart'}>
																			<ActionIcon
																				onClick={() => {
																					checkTask(index);
																				}}
																				color={'green'}
																				variant={'transparent'}>
																				<Check />
																			</ActionIcon>
																			<Text weight={'bold'} style={{ textDecoration: task.done ? "line-through" : "" }}>{task.title}</Text>
																			<ActionIcon
																				onClick={() => {
																					deleteTask(index);
																				}}
																				color={'red'}
																				variant={'transparent'}>
																				<Trash />
																			</ActionIcon>

																		</Group>
																		<Group position={'apart'}>

																			<Text color={'dimmed'} size={'md'} mt={'sm'} style={{ textDecoration: task.done ? "line-through" : "" }}>
																				{task.summary
																					? task.summary
																					: 'No summary was provided for this task'}
																			</Text>
																			<ActionIcon
																				onClick={() => {
																					updateTask(index);
																				}}
																				color={'blue'}
																				variant={'transparent'}>
																				<Pencil />
																			</ActionIcon>
																		</Group>

																	</Card>
																)}
															</Draggable>
														);
													}
												})
											) : (
												<Text size={'lg'} mt={'md'} color={'dimmed'}>
													You have no tasks
												</Text>
											)}
										</div>
									)}
								</Droppable>
							</DragDropContext>

						</Card>

					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
