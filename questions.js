var questions = [];
var i = 0;
var count = 0;
var score = 0;
var Ansgiven = []; // Store answers given by the user
var previousQuestionIndex = null; // Track the previously displayed question
var topicName = ''; // Variable to store the topic name
const submitSound =document.getElementById("submit-sound");

const uniqueKey = "G5_TRIAL";


// Helper function to save data in local storage under the unique key
function saveToLocalStorage(key, value) {
  let storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};
  storageData[key] = value;
  localStorage.setItem(uniqueKey, JSON.stringify(storageData));
}

// Helper function to get data from local storage under the unique key
function getFromLocalStorage(key) {
  let storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};
  return storageData[key];
}

fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // Get the selected topic from the URL
    const urlParams = new URLSearchParams(window.location.search);
    topicName = urlParams.get('topic'); // Store topic name for later use

    // Find the questions for the selected topic
    const selectedTopic = data.topics.find(t => t.heading === topicName);

    if (selectedTopic) {
      questions = selectedTopic.questions; // Access the questions array for the selected topic
      count = questions.length;

      // Store total number of questions in localStorage
      saveToLocalStorage(topicName + '_totalQuestions', count);

      // Load the heading from the selected topic
      document.getElementById('heading').innerText = topicName || 'Default Heading'; // Set default heading if not provided
      loadButtons();
      loadQuestion(i);

      // Retrieve topics from localStorage using your helper function
      const storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};  // Retrieve full storage data
      const topics = storageData['topics'] || []; // Get topics from storage data

      // Check if the selected topic is already stored to avoid duplicates
      if (!topics.find(t => t.heading === topicName)) {
        topics.push(selectedTopic); // Add the selected topic to the topics array
        storageData['topics'] = topics; // Update storageData with the new topics array
        localStorage.setItem(uniqueKey, JSON.stringify(storageData)); // Save updated storage back to localStorage
      }
    } else {
      document.getElementById('heading').innerText = 'Topic not found';
      document.getElementById('buttonContainer').innerHTML = 'No questions available for this topic.';
    }
  });


function loadButtons() {
  var buttonContainer = document.getElementById("buttonContainer");
  buttonContainer.innerHTML = ""; // Clear previous buttons
  for (var j = 0; j < questions.length; j++) {
    var btn = document.createElement("button");
    btn.className = "btn btn-default smallbtn";
    btn.innerHTML = "Q" + (j + 1);
    btn.setAttribute("onclick", "abc(" + (j + 1) + ")");

  //   // Check if the topic has been completed and disable the button if necessary
  //   if (localStorage.getItem(topicName + '_completed')) {
  //     btn.classList.add("disabled-btn");
  //     btn.disabled = true;
  //   }

  //   buttonContainer.appendChild(btn);
   // Check if the topic has been completed and disable the button if necessary
   if (getFromLocalStorage(topicName + '_completed')) {
    btn.classList.add("disabled-btn");
    btn.disabled = true;
    // console.log("Topic Completed Status:", getFromLocalStorage(topicName + '_completed'));

  }

buttonContainer.appendChild(btn);
  }
  // Highlight the button for the current question
  highlightButton(i);
  // Update button styles based on answered questions
  updateButtonStyles();

}
let currentSound = null; // Variable to keep track of the currently playing sound

function loadQuestion(index) {

  var randomQuestion = questions[index];
  console.log("random",randomQuestion);

  if (!randomQuestion) {
    console.error("No question found at index:", index);
    return;
  }

  

  // Set question text
  var questionElement = document.getElementById("question");
  questionElement.innerHTML = randomQuestion.question; // Set the question text

  // Check if there is a sound associated with the question
  if (randomQuestion.questionSound) {
    var soundButton = document.createElement("button");
    soundButton.className = "btn btn-sound";
    soundButton.innerText = "🔊 Play Sound";
    soundButton.onclick = function() {
      var sound = new Audio(randomQuestion.questionSound);
      sound.play();
    };
    questionElement.appendChild(soundButton);
  }

  // Iterate through the options and display them
  // Iterate through the options and display them
  var optionsElement = document.getElementById("options");
  optionsElement.innerHTML = ""; // Clear existing options

  // Check if any option has an image
  var hasImageOptions = randomQuestion.options.some(option => option.image);
  var hasTextOnlyOptions = randomQuestion.options.every(option => !option.image);

  // Apply layout based on content
  if (hasImageOptions) {
    optionsElement.classList.add("grid-layout");
    optionsElement.classList.remove("text-only");
  } else if (hasTextOnlyOptions) {
    optionsElement.classList.add("text-only");
    optionsElement.classList.remove("grid-layout");
  }

  var selectedLi = null;
  var defaultBackgroundColor = "#699e19";
  // Iterate through the options and display them
  randomQuestion.options.forEach(function(option, idx) {
    var li = document.createElement("li");
    li.classList.add("option-container");
    li.setAttribute("onclick", "optionContainer()");
    li.onclick = function() {
      // If there is already a selected li, remove its style
      if (selectedLi) {
          selectedLi.style.border = "";
          selectedLi.style.background="none";
      }

      // Add the border to the clicked li
      li.style.border = "3px solid";
      li.style.borderRadius="8px";
      li.style.background="#E2BFD9";

      const btnOption = li.querySelector('.btnOption');
    

      // Update the selectedLi variable to the currently clicked li
      selectedLi = li;
  };

    // Create the radio button for the option
    var radioButton = document.createElement("input");
    radioButton.type = "radio";
    radioButton.name = "answer";
    radioButton.value = idx;
    radioButton.style.display = "none"; // Hide the radio button

    if (option.image) {
      // Create the image element for the option
      var optionWithImage=document.getElementById("options");
      optionWithImage.style.display="grid";
      optionWithImage.style.gridTemplateColumns="repeat(2,1fr)";
      optionWithImage.style.gap="1rem";
      var optionImage = document.createElement("img");
      optionImage.src = option.image;
      optionImage.alt = "Option Image";
      optionImage.style.height = "150px";
      optionImage.style.cursor = "pointer";
      optionImage.style.borderRadius = "12px";
      
      optionImage.onclick = function() {
        radioButton.checked = true;

         // Select the corresponding radio button
        handleAnswerChange(); // Call the answer change handler
      };

      optionImage.onmouseover = function() {
        // optionImage.style.border = "5px solid black";
        if (option.sound) {
          playOptionSound(option.sound);
        }
      };

      optionImage.onmouseout = function() {
        optionImage.style.border = "none";
      };

      // Append the image to the list item
      li.appendChild(optionImage);
    } 
    else 
    {
      var selectedButton = null;
      var defaultBackgroundColor = "#699e19";
      
      var optionWithText=document.getElementById("options");
      optionWithText.style.display="flex";
      optionWithText.style.flexDirection="column";

      var optionTextButton = document.createElement("button");
      optionTextButton.className = "btnOption btn btn-option";
      optionTextButton.textContent = option.text;
      optionTextButton.onclick = function() {
        radioButton.checked = true; // Select the corresponding radio button
       

      // Set the background color of the clicked button to yellow
      

      // Update the selectedButton variable to the currently clicked button
      selectedButton = optionTextButton;
        handleAnswerChange(); // Call the answer change handler
      };

      // Append the text button to the list item
      li.appendChild(optionTextButton);
    }

    // Append the radio button and text button/image to the list item
    li.appendChild(radioButton);

    // Append the list item to the options container
    optionsElement.appendChild(li);
  });

  var previouslySelected = Ansgiven[index];
  if (previouslySelected !== null && previouslySelected !== undefined) {
    var previouslySelectedElement = optionsElement.querySelector('input[name="answer"][value="' + previouslySelected + '"]');
    if (previouslySelectedElement) {
      previouslySelectedElement.checked = true;
  
      // Find the corresponding button or image based on the index
      var previouslySelectedLi = previouslySelectedElement.closest('li');
  
      // Apply styling to the previously selected option
      if (previouslySelectedLi) {
        previouslySelectedLi.style.border = "3px solid";
        previouslySelectedLi.style.borderRadius = "8px";
        selectedLi = previouslySelectedLi; // Update selectedLi with the previously selected element
      }
    }
  }

  // Update button visibility based on whether an answer is selected
  updateButtonVisibility();
  // Highlight the button for the current question
  highlightButton(index);
  // Update button styles
  updateButtonStyles();

  // Update the Next button or Submit Answers button
  updateButtonText();
  // if(randomQuestion.story){
  //   const storyElement = document.getElementById("story-here");
  //   storyElement.innerHTML = `<p>${randomQuestion.story}</p>`;
  // }
  if (randomQuestion.story) {
   
    const readButton = document.getElementById("readButton");
    const storyContent = randomQuestion.story;
  
    
    readButton.style.display = "block"; 
  
    
    readButton.addEventListener("click", function () {
      // Set the content of the modal
      document.getElementById("modalContent").innerHTML = storyContent;
  
      // Show the modal
      $('#storyModal').modal('show');
    });
  }
}

function playOptionSound(option) {
  var sound = new Audio(option);
  sound.play();
}


function playSound(soundFile) {
  var audio = new Audio(soundFile);
  audio.play();
}


// function saveCurrentAnswer() {
//   var selectedAnswer = document.querySelector('input[name="answer"]:checked');
//   var textAreaAnswer = document.getElementById("answerTextArea");

//   if (selectedAnswer) {
//     Ansgiven[i] = questions[i].options.indexOf(selectedAnswer.value);
//   } else if (textAreaAnswer && textAreaAnswer.value.trim() !== "") {
//     Ansgiven[i] = textAreaAnswer.value.trim();
//   } else {
//     Ansgiven[i] = null; // Mark as not answered
//   }
//   saveToLocalStorage('Ansgiven', Ansgiven); // Save the updated answers array to local storage

// }

// Save the answer for the current question
function saveCurrentAnswer() {
  var selectedAnswer = document.querySelector('input[name="answer"]:checked');
  if (selectedAnswer) {
    Ansgiven[i] = parseInt(selectedAnswer.value); // Store answer as an index
  } else {
    Ansgiven[i] = null; // Mark as not answered
  }
  saveToLocalStorage('Ansgiven', Ansgiven); // Save the updated answers array to local storage

}


function handleAnswerChange() {
  // Show the Submit Answer button and hide the Next button when an answer is selected
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";
}

function newques() {
  // Save the answer for the current question
  isSubmitted = false; // Reset when loading new question
  updateButtonVisibility();
  saveCurrentAnswer();

  if (i === count - 1) {
    // Display results
    displayResults();
    // Hide buttonContainer
    document.getElementById("buttonContainer").style.display = "none";
    document.getElementById("questiondiv").style.padding = "3rem";

    document.getElementById("questiondiv").style.backgroundColor = "#8FD8D2";
  
  } else {
    // Move to the next question
    i++;
    loadQuestion(i);
    document.getElementById("result").innerHTML = "";
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";
    
    // Update button visibility and styles
    
    updateButtonStyles();
  }
}


function displayResults() {

  if (currentSound) {
    currentSound.pause(); // Pause the current sound
    currentSound.currentTime = 0; // Reset the current time
  }

  // Create a new Audio object and play the sound
  const sound = new Audio('./assests/sounds/displayResults.mp3');
  currentSound = sound; // Update the current sound variable
  sound.play()
      .then(() => {
          console.log('Sound played successfully');
      })
      .catch((error) => {
          console.error('Error playing sound:', error);
      });
  // Calculate the score based on saved answers
  score = Ansgiven.reduce((total, answer, index) => {
    if (questions[index].options) {
      // Multiple-choice question
      return answer === questions[index].answer ? total + 1 : total;
    } else {
      // Open-ended question
      document.getElementById("picdiv").style.display = "none";
      document.getElementById("questiondiv").style.width = "100%";
      return answer === questions[index].answer ? total + 1 : total;
    }
  }, 0);
console.log("score",score);

  // Save score and completion status to local storage
  saveToLocalStorage(topicName + '_score', score);
  saveToLocalStorage(topicName + '_completed', 'true'); // Mark topic as completed

  // Hide certain elements
  document.getElementById("question_background").style.display = "none";
  document.getElementById("question").style.display = "none";
  document.getElementById("nextbtn").style.display = "none";
  document.getElementById("result").style.display = "none";
  document.getElementById("options").style.display = "none";
  document.getElementById("head").innerHTML = "Check Your Answers";

  // Calculate percentage and feedback message
  var percentage = (score / count) * 100;
  var progressBarColor = "";
  var feedbackMessage = "";
console.log("percentage", percentage);
  if (percentage <= 40) {
    progressBarColor = "#F28D8D"; /* Dark Pastel Red */
    feedbackMessage = "You may need more practice.";
  } else if (percentage > 40 && percentage <= 70) {
    progressBarColor = "#6C8EBF"; /* Dark Pastel Blue */
    feedbackMessage = "Well done!";
  } else if (percentage > 70) {
    progressBarColor = "#B5E7A0"; /* Dark Pastel Green */
    feedbackMessage = "Excellent job!";
  }
console.log("percentage", percentage);
  document.getElementById("picdiv").style.backgroundColor = "#B7A0D0"; /* Dark Pastel Lavender */
  document.getElementById("picdiv").style.fontSize = "1.8rem"; /* Larger font size for feedback */
  document.getElementById("picdiv").style.textAlign = "center";
  document.getElementById("picdiv").style.color = "#333"; /* Darker color for text */

 
  var Dis = "<br><br><br><br><br>Thank you for participating.<br><br>Score: " + score + "/" + count + "<br><br>";
  var home = "<a href='index.html'><b class='btn btn-success next-btn-progress'>Next</b></a><br>";
  var content = Dis + feedbackMessage + "<br><div class='progress'> <div class='progress-bar' role='progressbar' aria-valuenow='" + percentage + "' aria-valuemin='0' aria-valuemax='100' style='width:" + percentage + "%;background-color:" + progressBarColor + ";'> </div></div>" + home;

  // Store the results content in local storage with a unique key
  saveToLocalStorage(topicName + '_results_content', content);

  // Prepare question and answer details
  var questionContent = "";
  document.getElementById("questiondiv").style.textAlign = "left";
  document.getElementById("questiondiv").style.color = "black";
  document.getElementById("questiondiv").style.fontSize = "18px";
  document.getElementById("questiondiv").innerHTML = ""; // Clear previous content

  for (var j = 0; j < questions.length; j++) {
    var ques = questions[j].question;
    // var correctAnswer = questions[j].options ? questions[j].options[questions[j].answer].text : questions[j].answer;
    // Get the correct answer, either as text or an image
var correctAnswer = questions[j].options ? 
(questions[j].options[questions[j].answer].image ? 
  "<img src='" + questions[j].options[questions[j].answer].image + "' alt='Correct Answer Image' style='width:100px;height:auto;'/>" : 
  questions[j].options[questions[j].answer].text) : 
questions[j].answer;

    var givenAnswer = Ansgiven[j];
console.log("givenAnswer", givenAnswer);
    if (questions[j].options) {
      // Multiple-choice question
      // givenAnswer = Ansgiven[j] !== undefined && Ansgiven[j] !== null ? questions[j].options[Ansgiven[j]].text : "Not Answered";
      givenAnswer = Ansgiven[j] !== undefined && Ansgiven[j] !== null ? 
  (questions[j].options[Ansgiven[j]].image ? 
    "<img src='" + questions[j].options[Ansgiven[j]].image + "' alt='Given Answer Image' style='width:100px;height:auto;'/>" : 
    questions[j].options[Ansgiven[j]].text) : 
  "Not Answered";

      var passage = questions[j].passage ? "<br><b>Passage:</b> " + questions[j].passage + "<br>" : ""; // Check if passage is present
      console.log("Ansgiven", Ansgiven[j]);

      // Display the image or text label for correct answer
      // correctAnswer = ques.image ? "<img src='" + ques.image + "' alt='Answer Image' style='width: 50px; height: 50px;'>" : getOptionLabel(ques);

      var num = j + 1;
      // questionContent += "Q." + num + " " + ques + passage + "<br>" + "Correct Answer: " + correctAnswer + "<br>" + "Answer Given: " + givenAnswer + "<br><br>";
      var givenAnswerStyle;
      if (givenAnswer === "Not Answered") {
        givenAnswerStyle = "color: red;"; // Not answered
      } else if (givenAnswer === correctAnswer) {
        givenAnswerStyle = "color: green;"; // Correct answer
      } else {
        givenAnswerStyle = "color: red;"; // Incorrect answer
      }
      // questionContent += "Q." + num + " " + ques + passage + "<br>" + "Correct Answer: " + correctAnswer + "<br>" + "Answer Given: " + givenAnswer + "<br><br>";
      questionContent += "Q." + num + " " + ques + passage + "<br>" + 
      "Correct Answer: " + correctAnswer + "<br>" + 
      `<span style="${givenAnswerStyle}">Answer Given: ${givenAnswer}</span><br><br>`; // Apply style
    } else {
      // Open-ended question
      givenAnswer = givenAnswer !== null ? givenAnswer : "Not Answered";
      correctAnswer = questions[j].answer;
      var num = j + 1;
      // questionContent += "Q." + num + " " + ques + "<br><br>Answer Given: " + givenAnswer + "<br><br>";
      var givenAnswerStyle = (givenAnswer === "Not Answered" || givenAnswer !== correctAnswer) ? "color: red;" : "";

      questionContent += "Q." + num + " " + ques + "<br><br>" + 
        `<span style="${givenAnswerStyle}">Answer Given: ${givenAnswer}</span><br><br>`; // Apply style
        // questionContent += "Q." + num + " " + ques + "<br><br>Answer Given: " + givenAnswer + "<br><br>";
    }
  }

  // Store the question content in local storage with a unique key
  saveToLocalStorage(topicName + '_question_content', questionContent);

  document.getElementById("picdiv").innerHTML = content;
  document.getElementById("questiondiv").innerHTML = questionContent + home;
}

// Helper function to format answers
function formatAnswer(answer) {
  // if (answer.includes('.mp3')) {
  //     // Extract file name without extension
  //     return answer.split('/').pop().split('.').shift();
  // } else {
  //     return answer;
  // }
}



function checkAnswer() {
  submitSound.play();

  saveCurrentAnswer();
  document.getElementById("subbtn").style.display = "none";
  document.getElementById("nextbtn").style.display = "inline-block";
}

function abc(x) {
  // Save the current answer before changing questions
  saveCurrentAnswer();
  i = x - 1;
  loadQuestion(i);
  document.getElementById("result").innerHTML = "";
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";

  // Update button styles and visibility
  highlightButton(i);
  updateButtonStyles();
}
var isSubmitted = false;

function updateButtonVisibility() {
  var selectedAnswer = document.querySelector('input[name="answer"]:checked');
  var textAreaAnswer = document.getElementById("answerTextArea");
  var submitButton = document.getElementById("subbtn");
  var nextButton = document.getElementById("nextbtn");

  if (!isSubmitted) {
    // Show Submit button when question loads
    submitButton.style.display = "inline-block";
    nextButton.style.display = "none";
  } else {
    // After submission, hide Submit and show Next button
    submitButton.style.display = "none";
    nextButton.style.display = "inline-block";
  }
}

function submitAnswer() {
  isSubmitted = true; // Mark as submitted
  updateButtonVisibility(); // Update buttons
}

function highlightButton(index) {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove highlight from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("highlighted-btn");
  }

  // Add highlight to the current button
  if (index >= 0 && index < buttons.length) {
    buttons[index].classList.add("highlighted-btn");
  }
}

function updateButtonStyles() {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove "answered-btn" class from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("answered-btn");
  }


  Ansgiven.forEach((answer, index) => {
    if (answer !== null) { // Ensure the answer is not null
      if (index >= 0 && index < buttons.length) {
        buttons[index].classList.add("answered-btn");
      }
    }
  });
}

function updateButtonText() {
  var nextButton = document.getElementById("nextbtn");
  if (i === count - 1) {
    nextButton.innerHTML = "FINISH TEST";
    nextButton.onclick = function() {
      newques(); // Calls newques which will hide buttonContainer
    };
  } else {
    nextButton.innerHTML = "Next";
   
  }
}


