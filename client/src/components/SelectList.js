import React from "react";

const SelectList = ({ listElements, onSelect, title }) => {
	return (
		<>
			<h1 key="title">{title}</h1>
			<>
				{listElements && (
					<ul>
						{listElements.map((listElement, i) => (
							<li key={i} onClick={() => onSelect(listElement)}>
								{listElement}
							</li>
						))}
					</ul>
				)}
			</>
		</>
	);
};

export default SelectList;
