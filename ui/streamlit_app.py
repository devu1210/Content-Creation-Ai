import streamlit as st
import sys
import os

# Fix backend import
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from prompt_builder import build_prompt
from LLM_service import generate_response


# Title
st.title("AI Content Creation System")


# Dynamic user inputs

content_type = st.selectbox(
    "Select Content Type",
    ["Linkedin", "Email", "Advertisement"]
)

topic = st.text_input(
    "Enter Topic"
)

tone = st.selectbox(
    "Select Tone",
    [
        "Professional",
        "Friendly",
        "Technical",
        "Casual",
        "Persuasive"
    ]
)

role = st.selectbox(
    "Select Target Audience",
    [
        "Student",
        "Software Engineer",
        "Manager",
        "Business Owner",
        "General Audience"
    ]
)

length = st.selectbox(
    "Select Content Length",
    [
        "100 words",
        "200 words",
        "300 words",
        "500 words"
    ]
)

format_type = st.selectbox(
    "Select Output Format",
    [
        "Paragraph",
        "Bullet Points",
        "With Emojis"
    ]
)


# Keywords only for LinkedIn and Ad

keywords = None

if content_type != "email":

    keywords = st.text_input(
        "Enter Keywords (comma separated)"
    )


# Generate button

if st.button("Generate Content"):

    if topic.strip() == "":
        st.warning("Please enter a topic")

    else:

        # Build dynamic prompt
        prompt = build_prompt(
            content_type,
            topic,
            tone,
            role,
            length,
            format_type,
            keywords
        )

        # Call LLM service
        response = generate_response(prompt)

        # Show output
        st.subheader("Generated Content")

        st.write(response)
