# CTF Challenge Generator AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered application to generate custom pwn and reverse engineering CTF challenges. Users can select topics and languages manually or be guided by an AI assistant to create tailored challenges with source code, compilation steps, and detailed solution walkthroughs.

 
*(Note: Replace this with a screenshot or GIF of your application)*

---

## About The Project

This project was born out of the need for accessible, on-demand practice material for cybersecurity enthusiasts learning penetration testing and reverse engineering. Finding high-quality, specific challenges can be difficult. This tool leverages the power of the Google Gemini API to generate an endless supply of unique challenges tailored to your exact learning needs.

Whether you're a beginner wanting to understand the basics of a stack buffer overflow or an expert looking to practice complex ROP chains, this generator can craft a suitable exercise for you.

---

## Features

-   **Two Generation Modes:**
    -   **Manual Setup:** For users who know exactly what they want. Select from a wide range of languages, vulnerabilities, platforms, and code styles.
    -   **AI Guided:** A conversational interface that helps you define your challenge. Just chat with the AI about what you want to learn, and it will create a summary for generation.
-   **Rich Customization:**
    -   **Languages:** C, C++, Python3, Go, Rust, Assembly, and more.
    -   **Topics:** Stack/Heap Exploitation, ROP, Format String, UAF, Obfuscation, Packers, and many others.
    -   **Difficulty:** From "Easy" to "Insane".
    -   **Platforms:** Generate code and compilation instructions for Linux, Windows, macOS, and Android on various architectures (x86, x86-64, ARM64).
-   **Complete Challenge Packages:**
    -   Generates all necessary source code files.
    -   Provides detailed, step-by-step instructions in Markdown format, covering compilation, execution, and a full solution guide.
    -   Creates a unique, AI-generated conceptual image for each challenge theme.
-   **User-Friendly Output:**
    -   Clean, tabbed interface for viewing instructions and code.
    -   Syntax highlighting and "Copy" buttons for all code blocks.
    -   **Download ZIP:** Package all generated files (code, instructions, image) into a single zip archive for offline use.

---

## Built With

-   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **AI Model:** [Google Gemini API](https://ai.google.dev/)
-   **ZIP Functionality:** [JSZip](https://stuk.github.io/jszip/)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need a Google Gemini API key to use this application.
-   Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Running the App

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/MOAHSA/CTF-Challenge-Generator-AI.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd CTF-Challenge-Generator-AI
    ```
3.  **Set up your API Key:**
    This project is designed to be run in an environment where the `process.env.API_KEY` variable is available. A simple way to do this for local development is to use a tool like [Vite](https://vitejs.dev/).

    If you are using Vite or a similar development server:
    -   Create a new file named `.env` in the root of the project directory.
    -   Add your API key to the `.env` file like this:
        ```
        VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```
    - You would then need to adjust `services/geminiService.ts` to use `import.meta.env.VITE_API_KEY` instead of `process.env.API_KEY`.

4.  **Run the application:**
    Serve the `index.html` file using a local web server. If you have NodeJS installed, you can use a simple package like `serve`.
    ```sh
    # Install serve globally (if you haven't already)
    npm install -g serve

    # Run the server from the project root
    serve .
    ```
    Now, you can open your browser and navigate to the local address provided by the server (e.g., `http://localhost:3000`).

---

## Usage

1.  **Choose Your Mode:**
    -   Select **Manual Setup** to configure the challenge parameters yourself.
    -   Select **AI Guided** to start a conversation with the AI assistant.
2.  **Configure or Converse:**
    -   In Manual mode, select your desired languages, topics, difficulty, code style, and target platform.
    -   In AI Guided mode, chat with the AI about your requirements. Click "Done" when you're finished, and the AI will provide a summary.
3.  **Generate:**
    -   Click the **Generate Challenge** button. The AI will begin crafting your custom challenge.
4.  **Explore & Download:**
    -   Once generated, you can view the instructions and source code in the output section.
    -   Use the **Download ZIP** button to save all files to your computer.

---

## Roadmap

-   [ ] Add support for more complex, multi-stage challenges.
-   [ ] Implement a "hint" system within the generated instructions.
-   [ ] Introduce more languages and vulnerability categories.
-   [ ] Allow users to upload existing binaries for the AI to analyze and create documentation for.

See the [open issues](https://github.com/MOAHSA/CTF-Challenge-Generator-AI/issues) for a full list of proposed features (and known issues).

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgments

-   This project is powered by the incredible capabilities of the **Google Gemini API**.
-   Thanks to the open-source community for providing the tools and libraries that made this possible.
