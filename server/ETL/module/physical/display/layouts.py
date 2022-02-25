from PIL import Image, ImageDraw


class BasicList:
    def __init__(
        self,
        title,
        width,
        height,
        colors,
        font_text,
        font_title,
        padding=(15, 5, 15, 15),
        line_spacing=0.5,
        max_lines=100,
    ):

        self.w = width
        self.h = height
        self.c = colors

        self.list_entries = []
        self.last_pos = 0
        self.title = title

        self.font_title = font_title
        self.font_text = font_text

        self.PADDING = padding  # left, top, right, bottom
        self.LINE_SPACING = line_spacing

        self.max_lines = max_lines

    def add_element(self, list_entry):
        if len(self.list_entries) > self.max_lines:
            self.list_entries.pop(0)
        self.list_entries.append(list_entry)

    def get_image(self, position=0, line_width=1):
        self.last_pos = position
        # create image
        image = Image.new("L", (self.w, self.h), self.c[0])  # 255: all white
        draw = ImageDraw.Draw(image)

        # current y position
        offset_y = 0

        offset_y += self.PADDING[1]

        # draw title (bold)
        draw.text(
            (self.PADDING[0], offset_y),
            self.title,
            font=self.font_title,
            fill=self.c[3],
        )
        # draw line below title
        title_height = self.font_title.getsize(self.title)[1]
        offset_y += title_height + line_width

        draw.line((0, offset_y, self.w, offset_y), fill=self.c[2], width=line_width)

        text_base_height = self.font_text.getsize("A")[1]

        offset_y += text_base_height * self.LINE_SPACING

        # for each list_entry: (starting at start_postion = position)
        for list_entry in self.list_entries[::-1][position:]:

            list_entry_lines = self.__split_lines(
                list_entry, self.font_text, self.w - self.PADDING[0] - self.PADDING[2]
            )
            # print(list_entry_lines)

            # if screen has space left:
            line_height = self.font_text.getsize(list_entry)[1]
            entry_height = line_height * len(list_entry_lines) + (
                text_base_height * self.LINE_SPACING
            ) * (len(list_entry_lines) - 1)

            if offset_y + entry_height + self.PADDING[3] <= self.h:

                for line in list_entry_lines:
                    # draw entry_text
                    draw.text(
                        (self.PADDING[0], offset_y),
                        line,
                        font=self.font_text,
                        fill=self.c[3],
                    )
                    # draw line_below
                    offset_y += line_height + text_base_height * self.LINE_SPACING

                draw.line(
                    (0, offset_y, self.w, offset_y), fill=self.c[2], width=line_width
                )
                offset_y += text_base_height * self.LINE_SPACING

            # else (if has no more space left but more entries)
            else:
                # draw arrow down
                draw.polygon(
                    [
                        (self.w - 5, self.h - 10),
                        (self.w - 15, self.h - 10),
                        (self.w - 10, self.h - 5),
                    ],
                    fill=self.c[3],
                )
                # break
                break

        # if position =! 0:
        if position != 0:
            # draw arrow up
            draw.polygon(
                [(self.w - 5, 10), (self.w - 15, 10), (self.w - 10, 5)], fill=self.c[3]
            )

        # return image
        return image

    @staticmethod
    def __split_lines(text, font, max_width):
        if font.getsize(text)[0] <= max_width:
            return [text]

        lines = []
        current_line = ""
        for word in text.split(" "):
            if font.getsize(current_line + word)[0] > max_width:
                lines.append(current_line)
                current_line = word + " "
            else:
                current_line += word + " "

        if current_line != "":
            lines.append(current_line)
        return lines
