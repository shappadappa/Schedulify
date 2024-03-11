/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontSize: {
				"xxs": "0.6rem"
			},
			animation: {
				"drop-down": "drop-down 0.35s ease-out forwards",
				"rise": "rise 0.35s ease-out forwards"
			},
			keyframes: {
				"drop-down": {
					"0%": {
						transform: "translateY(-100%)",
						opacity: 0
					},
					"100%": {
						transform: "translateY(0)",
						opacity: 1
					}
				},
				"rise": {
					"0%": {
						transform: "translateY(0)",
						opacity: 1
					},
					"100%": {
						transform: "translateY(-100%)",
						opacity: 0
					}
				}
			}
		}
	},
	plugins: [],
}